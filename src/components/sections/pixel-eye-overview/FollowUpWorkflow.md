# PixelEye Follow-Up Workflow

This document describes the end-to-end follow-up flow for PixelEye, covering:

- the UI shown in the Overview section,
- the backend logic that creates and sends follow-up notifications,
- and the database tables that store the lead and notification state.

## 1. Workflow Summary

PixelEye follow-ups are driven by the lead status and the follow-up date on each lead.

High level flow:

1. A lead is created or updated in PixelEye.
2. The backend validates the lead data and saves it in the `pixel_eye` table.
3. The notification service decides whether the lead needs a callback reminder.
4. If a reminder is required, a row is created or updated in `pixel_eye_lead_states`.
5. The scheduler runs every minute and checks for due reminders.
6. When a reminder is due, the backend sends a Google Chat notification.
7. The Overview UI reads the lead list and shows follow-up metrics, overdue leads, today's reminders, and upcoming reminders.

## 2. UI Workflow

The Overview section is rendered from:

- [`frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx`](./DashboardPage.tsx)
- [`frontend/src/components/sections/pixel-eye-overview/dark/OverviewDashboard.tsx`](./dark/OverviewDashboard.tsx)
- [`frontend/src/components/sections/pixel-eye-overview/dark/FollowUpPanel.tsx`](./dark/FollowUpPanel.tsx)
- [`frontend/src/components/sections/pixel-eye-overview/dashboardUtils.ts`](./dashboardUtils.ts)

### UI responsibilities

1. `DashboardPage.tsx` fetches PixelEye leads from `GET /api/v1/pixeleye`.
2. `dashboardUtils.ts` converts raw leads into dashboard metrics.
3. `OverviewDashboard.tsx` arranges the cards, charts, and follow-up panel.
4. `FollowUpPanel.tsx` shows:
   - overdue follow-ups,
   - today's follow-ups,
   - upcoming follow-ups,
   - and the lead rows for each bucket.

### What the user sees

- Total lead count
- Contacted leads
- Appointments
- Lost leads
- Trend charts
- Follow-up reminder buckets
- Lead details such as:
  - customer name
  - agent name
  - phone number
  - status
  - follow-up date

### UI logic for follow-up

The UI treats a lead as a follow-up lead when:

- the status is one of the follow-up categories, or
- the `follow_up_date` is today or earlier.

Common follow-up statuses in the UI and business logic include:

- `Hot Follow-up`
- `Follow-up Required`
- `Will Call Later`
- `Rescheduling`
- `Doctor Time`
- `Follow-up Post Appointment`
- `Want to Speak With Doctor`
- `Appointment Cancelled`
- `Address Requested`
- `Searching for Specific Hospital`
- `Others`

## 3. Backend Workflow

The backend follow-up workflow is implemented mainly in:

- [`backend/src/modules/pixelEye/pixelEye.service.js`](../../../../../backend/src/modules/pixelEye/pixelEye.service.js)
- [`backend/src/modules/pixelEye/pixelEyeNotification.service.js`](../../../../../backend/src/modules/pixelEye/pixelEyeNotification.service.js)
- [`backend/src/modules/pixelEye/webhook/pixelEyeWebhook.service.js`](../../../../../backend/src/modules/pixelEye/webhook/pixelEyeWebhook.service.js)
- [`backend/src/modules/pixelEye/webhook/pixelEyeWebhook.controller.js`](../../../../../backend/src/modules/pixelEye/webhook/pixelEyeWebhook.controller.js)
- [`backend/src/modules/pixelEye/pixelEyeScheduler.js`](../../../../../backend/src/modules/pixelEye/pixelEyeScheduler.js)

### Backend flow for a new lead

1. The webhook receives a lead payload.
2. The payload is normalized and validated.
3. The lead is inserted into `pixel_eye`.
4. `processLeadStatus()` runs after the transaction commits.
5. The service checks the status category.
6. If the status requires a callback, a state row is created in `pixel_eye_lead_states`.

### Backend flow for a status update

1. The lead is updated in `pixel_eye`.
2. If the status changed, `processLeadStatus()` runs again.
3. The service checks whether the new status is:
   - terminal,
   - no action,
   - or schedulable.
4. Terminal or success statuses cancel pending callbacks.
5. Schedulable statuses create or refresh the reminder state.

### Backend flow for day-based follow-up

Manual changes to `day_1` through `day_5` trigger `processDayStatus()`.

That function:

1. Reads the current lead state.
2. Prevents backward day changes from creating stale reminders.
3. Cancels the reminder if the day value is terminal or complete.
4. Schedules the correct callback window when the day value maps to a follow-up category.

### Scheduler flow

`pixelEyeScheduler.js` runs a cron job every minute:

- It calls `sendDueNotifications()`.
- It prevents overlap with the `noOverlap` cron option and the local `_isRunning` guard.
- It stops old notifications from retrying forever by using a retry window.

When a reminder is due:

1. The backend loads scheduled rows from `pixel_eye_lead_states`.
2. It verifies the reminder is still valid.
3. It re-fetches the latest lead record.
4. It cancels the reminder if the lead is now terminal.
5. It builds a Google Chat message.
6. It sends the message.
7. It marks the state as completed.

## 4. Database Structure

The follow-up system uses two main tables.

### `pixel_eye`

This is the source lead table.

Important columns used by the workflow:

- `id`
- `client_id`
- `call_id`
- `customer_name`
- `phone_number`
- `agent_name`
- `status`
- `day_1` through `day_5`
- `follow_up_date`
- `source`
- `type_of_enquiry`
- `date`
- `time`

Purpose:

- stores the live lead record,
- stores the current status and day values,
- and drives follow-up classification.

### `pixel_eye_lead_states`

This table stores reminder and callback state.

Important columns used by the workflow:

- `id`
- `client_id`
- `call_id`
- `state`
- `day1_mode`
- `schedule_type`
- `reason`
- `scheduled_at`
- `notification_sent`
- `notification_sent_at`
- `permanently_closed`
- `cancel_reason`
- `current_day`
- `last_status`
- `customer_name`
- `phone_number`
- `agent_name`

Purpose:

- stores the active reminder state for a lead,
- prevents duplicate notifications,
- tracks whether the reminder was sent,
- records why a reminder was cancelled,
- and keeps the scheduler aligned with the current day flow.

### State lifecycle

The reminder state normally moves through these phases:

1. `new`
2. `baseline`
3. `scheduled`
4. `completed`
5. `cancelled`

### Scheduling rules

The backend maps statuses into these categories:

- `THIRTY_MIN`
- `DNP2`
- `TWENTY_FOUR_HR`
- `TERMINATION`
- `NO_ACTION`
- `UNKNOWN`

Behavior by category:

- `THIRTY_MIN`: schedule a callback 30 minutes later.
- `DNP2`: schedule a 24-hour callback.
- `TWENTY_FOUR_HR`: schedule a 24-hour follow-up.
- `TERMINATION`: cancel future callbacks.
- `NO_ACTION`: cancel future callbacks.
- `UNKNOWN`: store the lead as baseline without scheduling.

## 5. Follow-Up Scenarios

### Scenario A: Lead enters a follow-up status

Example:

- status becomes `Hot Follow-up`

Result:

1. Lead is saved in `pixel_eye`.
2. A reminder row is created in `pixel_eye_lead_states`.
3. The scheduler waits until `scheduled_at`.
4. The reminder is delivered to Google Chat.

### Scenario B: Lead becomes terminal

Example:

- status becomes `Not Interested`
- status becomes `Closed`
- status becomes `Appointment Fixed`

Result:

1. Existing reminder state is cancelled.
2. No further callback is sent.
3. The lead is marked as closed or success-complete from the follow-up perspective.

### Scenario C: Agent updates the lead manually

If the agent changes:

- `status`
- `day_1` to `day_5`
- `follow_up_date`

then the backend recomputes the follow-up state and updates the reminder flow.

## 6. Data Source For Overview Metrics

The Overview UI is not a separate data store.

It is computed from:

- the live `pixel_eye` lead records,
- the current status values,
- the `follow_up_date`,
- and the grouped status sets in `dashboardUtils.ts`.

This means the overview screen always reflects current lead state, not a copied snapshot.

## 7. Operational Notes

- The scheduler runs once per minute.
- The backend now protects the minute job from overlap.
- The Google Chat webhook call has a timeout so the scheduler cannot hang forever.
- Overdue reminders are cancelled after the retry window expires.
- The workflow is tenant-aware through `client_id`.

## 8. Short Version

If you want the shortest possible summary:

1. Lead comes in.
2. Backend saves it in `pixel_eye`.
3. Status determines whether a follow-up is needed.
4. Reminder state is saved in `pixel_eye_lead_states`.
5. Cron checks every minute.
6. Due reminders go to Google Chat.
7. Overview UI displays the same live follow-up data as dashboard metrics.
