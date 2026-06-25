# PixelEye Follow-Up Flow

This document explains the PixelEye follow-up system end to end:

- how the frontend surfaces follow-up work
- how the backend decides what should happen
- which database tables store the workflow state
- which functions drive create, update, reschedule, cancel, outcome, and scheduler behavior

The goal is to give a complete working map of the follow-up lifecycle without mixing it up with the rest of PixelEye CRM behavior.

---

## 1. What "follow-up" means in this codebase

PixelEye uses two related but different follow-up paths:

1. Manual follow-up queue
   - driven by `follow_up_date`
   - shown on the Follow-Ups page
   - used for reschedule/cancel/manual queue handling

2. Reminder/state follow-up
   - driven by lead status, day fields, and reminder state rows
   - stored in `pixel_eye_lead_states`
   - used by the scheduler and notification tracker

These two paths are connected, but they are not the same thing.

Important rule:

- `follow_up_date` is the manual follow-up date.
- `scheduled_at` in `pixel_eye_lead_states` is the reminder timestamp used by the reminder engine.

---

## 2. Frontend surface area

### Main files

- `frontend/src/pages/pixel-eye/follow-ups.tsx`
- `frontend/src/components/sections/pixel-eye-follow-ups/index.tsx`
- `frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`
- `frontend/src/components/sections/pixel-eye/index.tsx`
- `frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx`

### Shared frontend logic

- `frontend/src/components/hooks/usePixelEyeQuery.tsx`
- `frontend/src/components/sections/pixel-eye/pixelEyeStatuses.ts`
- `frontend/src/components/sections/pixel-eye-overview/dashboardUtils.ts`
- `frontend/src/components/sections/pixel-eye-follow-ups/followUpLifecycleSummary.ts`
- `frontend/src/components/sections/pixel-eye-follow-ups/FollowUpLifecycleDetails.tsx`

### What each screen does

- Leads page
  - creates and edits leads
  - shows lead rows, follow-up date, and day fields
  - opens follow-up actions from the table

- Follow-Ups page
  - shows only manual follow-up leads
  - groups them into overdue, today, tomorrow, this week, and all
  - shows missed calls from the compliance table
  - lets users reschedule, cancel, or apply outcome

- Lead detail page
  - shows one lead
  - shows the follow-up history timeline
  - shows compliance rows
  - allows reschedule, cancel, and outcome updates

- Overview dashboard
  - reads the same lead data
  - computes follow-up metrics from the live lead list

---

## 3. Backend surface area

### Route entry points

- `backend/src/modules/pixelEye/pixelEye.routes.js`
- `backend/src/modules/pixelEye/pixelEye.controller.js`

### Core services

- `backend/src/modules/pixelEye/pixelEye.service.js`
- `backend/src/modules/pixelEye/pixelEyeNotification.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpLifecycleSummary.service.js`
- `backend/src/modules/pixelEye/pixelEyeCallLog.service.js`

### Scheduler

- `backend/src/modules/pixelEye/pixelEyeScheduler.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js`

---

## 4. Database tables involved

### `pixel_eye`

Main lead row.

Important fields:

- `client_id`
- `call_id`
- `customer_name`
- `phone_number`
- `normalized_phone_number`
- `agent_name`
- `status`
- `day_1` to `day_5`
- `follow_up_date`
- `notes`
- `source`
- `type_of_enquiry`

Purpose:

- stores the live lead
- stores the day progression values
- stores the manual follow-up date

### `pixel_eye_lead_states`

Reminder and callback lifecycle row.

Important fields:

- `client_id`
- `call_id`
- `lead_id`
- `state`
- `schedule_type`
- `reason`
- `scheduled_at`
- `notification_sent`
- `notification_sent_at`
- `completion_source`
- `permanently_closed`
- `cancel_reason`
- `current_day`
- `last_status`
- `customer_name`
- `phone_number`
- `normalized_phone_number`
- `agent_name`

Purpose:

- stores whether a reminder is scheduled, completed, cancelled, or baseline
- stores the exact reminder time
- drives the scheduler and notification tracker

### `pixel_eye_follow_up_history`

Audit trail for follow-up date changes.

Important fields:

- `client_id`
- `lead_id`
- `call_id`
- `old_follow_up_date`
- `new_follow_up_date`
- `change_type`
- `reason`
- `metadata`
- `changed_by_user_id`
- `changed_by_name`
- `source`

Purpose:

- tracks create, update, reschedule, and clear events
- stores extra snapshots for UI history rendering

### `pixel_eye_follow_up_call_compliance`

Manual follow-up compliance row.

Important fields:

- `client_id`
- `lead_id`
- `call_id`
- `phone_number`
- `normalized_phone_number`
- `scheduled_follow_up_date`
- `scheduled_follow_up_at`
- `allowed_until`
- `compliance_status`
- `matched_call_log_id`
- `matched_call_id`
- `matched_call_started_at`
- `reason`
- `source`

Purpose:

- tracks whether the expected call happened
- marks rows as `PENDING`, `CALLED`, `MISSED`, `IGNORED`, or `CANCELLED`

### `pixel_eye_call_logs`

Webhook call history.

Purpose:

- records incoming Runo webhook call events
- lets the compliance scheduler match a real call against a follow-up window

---

## 5. Frontend follow-up flow

### 5.1 Follow-Ups page flow

File:

- `frontend/src/components/sections/pixel-eye-follow-ups/index.tsx`

What it does:

1. Loads all leads with `usePixelEyeQuery()`.
2. Loads follow-up lifecycle summary with `usePixelEyeFollowUpLifecycleSummaryQuery()`.
3. Loads missed compliance rows with `usePixelEyeMissedFollowUpsQuery()`.
4. Filters to manual follow-up leads only with `shouldIncludeInManualFollowUpQueue()`.
5. Groups them with `buildFollowUpPageBuckets()`.
6. Lets the user open:
   - reschedule drawer
   - cancel drawer
   - outcome drawer
7. Refetches cached queries after every mutation.

### 5.2 Lead detail page flow

File:

- `frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`

What it does:

1. Fetches the lead by id.
2. Fetches follow-up history for that lead.
3. Fetches compliance rows for the same lead or call.
4. Shows the current follow-up lifecycle state.
5. Lets the user:
   - reschedule the manual follow-up
   - cancel the follow-up
   - update the next structured day outcome

### 5.3 Shared query and mutation hooks

File:

- `frontend/src/components/hooks/usePixelEyeQuery.tsx`

Important hooks:

- `usePixelEyeQuery`
- `usePixelEyeLeadQuery`
- `useReschedulePixelEyeFollowUpMutation`
- `useCancelPixelEyeFollowUpMutation`
- `useUpdatePixelEyeFollowUpOutcomeMutation`
- `usePixelEyeMissedFollowUpsQuery`
- `usePixelEyeFollowUpCallComplianceSummaryQuery`
- `usePixelEyeFollowUpLifecycleSummaryQuery`

Mutation cache refresh behavior:

- invalidates leads
- invalidates single-lead queries
- invalidates notification and compliance queries
- invalidates history queries

This keeps the follow-up screen, detail screen, and dashboard aligned after every action.

---

## 6. Backend follow-up flow

### 6.1 Create lead flow

Entry points:

- `POST /api/v1/pixeleye`
- `createLead()` in `backend/src/modules/pixelEye/pixelEye.controller.js`
- `createPixelEyeLead()` in `backend/src/modules/pixelEye/pixelEye.service.js`

Create flow:

1. Validate request body.
2. Resolve the tenant/client.
3. Normalize the phone number.
4. Check for an active same-phone lead.
5. If a matching active lead exists, continue that lead instead of creating a duplicate.
6. If no duplicate exists, create the lead in `pixel_eye`.
7. If `follow_up_date` exists and is valid, schedule manual follow-up reminder state.
8. Write compliance row when a manual follow-up is scheduled.
9. Write follow-up history row for the created follow-up date.
10. If needed, run reminder state processing through `processLeadStatus()`.

Key functions:

- `createPixelEyeLead()`
- `findPixelEyeLeadByPhone()`
- `continuePixelEyeLeadFromManualCreate()`
- `scheduleManualFollowUpReminder()`
- `createOrUpdatePendingFollowUpCompliance()`
- `createFollowUpHistoryEntry()`

### 6.2 Generic update flow

Entry points:

- `PATCH /api/v1/pixeleye/:id`
- `updateLead()`
- `updatePixelEyeLead()`

Update flow:

1. Load the current lead.
2. Enforce role restrictions.
3. Block client users from directly editing day fields or overwriting an existing follow-up date.
4. Normalize status, phone number, notes, and day values.
5. Validate the follow-up date if it is being set.
6. Save the lead row.
7. If follow-up date changed, write history.
8. If follow-up date changed and is valid, schedule a manual reminder.
9. If status changed, call `processLeadStatus()`.
10. If a day field changed, call `processDayStatus()`.

Important rule:

- Clients use structured actions for day updates and reschedule operations.
- They should not patch `day_1` to `day_5` directly through the generic update path.

### 6.3 Structured follow-up outcome flow

Entry points:

- `PATCH /api/v1/pixeleye/:id/follow-up-outcome`
- `updateLeadFollowUpOutcome()`
- `applyPixelEyeFollowUpOutcome()`

Flow:

1. Read the lead.
2. Find the next empty day in `day_1` to `day_5`.
3. Check which outcomes are allowed for that day.
4. Write the selected outcome into the next empty day.
5. Reject the request if the lead is already complete or closed.
6. Reject the request if the chosen status is not allowed for the target day.

This flow is what powers the "Update Outcome" drawer on the follow-up page.

### 6.4 Reschedule flow

Entry points:

- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- `rescheduleLeadFollowUp()`
- `reschedulePixelEyeFollowUp()`

Flow:

1. Load the lead.
2. Reject closed or terminal leads.
3. Validate the new `follow_up_date`.
4. Update the lead row with the new date.
5. Cancel old pending compliance rows.
6. Schedule a new manual reminder in `pixel_eye_lead_states`.
7. Create a new pending compliance row.
8. Insert a follow-up history row with `change_type = RESCHEDULED`.

### 6.5 Cancel / close flow

Entry points:

- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`
- `cancelLeadFollowUp()`
- `cancelPixelEyeFollowUp()`

Flow:

1. Load the lead under tenant lock.
2. Decide whether the cancellation should permanently close the follow-up flow.
3. Clear `follow_up_date` on the lead if present.
4. Cancel pending compliance rows.
5. Mark or create the reminder state as `cancelled`.
6. Store cancel reason and closure flags.
7. Write follow-up history with `change_type = CLEARED`.

### 6.6 Scheduler flow

Reminder scheduler:

- `backend/src/modules/pixelEye/pixelEyeScheduler.js`

Compliance scheduler:

- `backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js`

What they do:

1. Find due reminder rows or due compliance rows.
2. Re-check the latest lead state.
3. Cancel rows if the lead is now terminal or closed.
4. Send the Google Chat reminder for due manual reminders.
5. Mark reminder/compliance rows as completed, called, missed, or ignored.
6. Advance or preserve the current lifecycle state as needed.

---

## 7. Status and queue logic

### Status definitions

The status rules are centralized in:

- `frontend/src/components/sections/pixel-eye/pixelEyeStatuses.ts`
- `backend/src/modules/pixelEye/pixelEyeStatusPolicy.js`

Relevant groups:

- `THIRTY_MIN` statuses
- `TWENTY_FOUR_HR` statuses
- `FORTY_EIGHT_HR` statuses
- `TERMINATION` statuses
- `NO_ACTION` statuses
- `NO_REMINDER` statuses

### Manual follow-up queue rules

The Follow-Ups page includes only leads that:

- have a valid `follow_up_date`
- are not hidden by reminder completion rules
- are not terminal
- are not cancelled or permanently closed
- still have incomplete outcome days

That logic is implemented in:

- `shouldIncludeInManualFollowUpQueue()`

### Notification tracker rules

The notification tracker is broader than the manual follow-up queue.

It includes reminder states that may be:

- scheduled
- completed
- cancelled
- baseline
- new

It also enriches the state rows with:

- day fields
- compliance status
- outcome status

---

## 8. How the history timeline works

History data comes from:

- `backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`

Frontend rendering helpers:

- `frontend/src/components/sections/pixel-eye-follow-ups/FollowUpLifecycleDetails.tsx`
- `frontend/src/components/sections/pixel-eye-follow-ups/followUpLifecycleSummary.ts`

What gets stored:

- old follow-up date
- new follow-up date
- change type
- reason
- metadata snapshots
- who changed it
- where it came from

The UI uses that history to show:

- created follow-up
- updated follow-up
- rescheduled follow-up
- cleared follow-up
- outcome application details

---

## 9. End-to-end follow-up scenarios

### Scenario A: New lead gets a follow-up date

1. User creates a lead.
2. `pixel_eye.follow_up_date` is saved.
3. Backend validates the date.
4. `pixel_eye_lead_states` gets a scheduled MANUAL reminder row.
5. `pixel_eye_follow_up_call_compliance` gets a pending row.
6. History row is written.
7. Follow-Ups page shows the lead in the manual queue.

### Scenario B: User reschedules the follow-up

1. User opens the reschedule drawer.
2. User picks a new future date.
3. Backend updates `pixel_eye.follow_up_date`.
4. Old compliance rows are cancelled.
5. New reminder row is scheduled.
6. New pending compliance row is inserted.
7. History row is written with `RESCHEDULED`.

### Scenario C: User cancels or closes the follow-up

1. User opens the cancel drawer.
2. User picks a closure reason.
3. Backend clears `follow_up_date`.
4. Pending compliance rows are cancelled.
5. Reminder state is marked cancelled.
6. History row is written with `CLEARED`.

### Scenario D: User applies the next outcome

1. User opens the outcome drawer.
2. Frontend asks the backend for the latest lead state.
3. Backend finds the next empty day field.
4. Backend writes the chosen day outcome.
5. The page refetches the lead, history, and compliance data.

### Scenario E: Scheduler sends the reminder

1. `pixelEyeScheduler.js` finds a due reminder row.
2. It re-checks the lead.
3. It sends the Google Chat message.
4. It marks the reminder as completed.
5. It cancels sibling active reminder rows for the same lead or call.

### Scenario F: Compliance scheduler checks whether a follow-up call happened

1. `pixelEyeFollowUpComplianceScheduler.js` finds due pending compliance rows.
2. It checks webhook call logs for the same date and phone number.
3. If a call exists, compliance becomes `CALLED`.
4. If the lead is terminal or closed, compliance becomes `IGNORED`.
5. If no call exists after the allowed window, compliance becomes `MISSED`.
6. If missed, the follow-up date may be cleared and history is written.

---

## 10. Useful API map

- `GET /api/v1/pixeleye`
  - list leads

- `GET /api/v1/pixeleye/:id`
  - load one lead

- `POST /api/v1/pixeleye`
  - create lead

- `PATCH /api/v1/pixeleye/:id`
  - update lead fields

- `PATCH /api/v1/pixeleye/:id/follow-up-outcome`
  - apply structured next-day outcome

- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
  - reschedule manual follow-up

- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`
  - cancel or permanently close follow-up

- `GET /api/v1/pixeleye/:id/follow-up/history`
  - fetch follow-up history

- `GET /api/v1/pixeleye/follow-ups/call-compliance`
  - fetch compliance rows

- `GET /api/v1/pixeleye/follow-ups/missed-calls`
  - fetch missed compliance rows

- `GET /api/v1/pixeleye/follow-ups/call-compliance-summary`
  - fetch compliance summary

- `GET /api/v1/pixeleye/follow-ups/lifecycle-summary`
  - fetch lifecycle summary

- `GET /api/v1/pixeleye/notifications`
  - fetch reminder states

- `GET /api/v1/pixeleye/notifications/summary`
  - fetch reminder counts

---

## 11. Short version

If you want the shortest possible mental model:

1. Lead data lives in `pixel_eye`.
2. Manual callback dates live in `follow_up_date`.
3. Reminder engine state lives in `pixel_eye_lead_states`.
4. Manual follow-up audit history lives in `pixel_eye_follow_up_history`.
5. Call compliance lives in `pixel_eye_follow_up_call_compliance`.
6. The Follow-Ups page shows manual queue work.
7. The Lead Detail page shows the full lifecycle for one lead.
8. The scheduler sends reminders and the compliance scheduler checks whether the call actually happened.

---

## 12. Where to read next

- `frontend/src/components/sections/pixel-eye-overview/FollowUpWorkflow.md`
- `frontend/src/components/sections/pixel-eye-lead-detail/PixelEyeLeadDetailArchitecture.md`
- `frontend/src/components/sections/pixel-eye/PixelEyeFullWorkflow.md`

