# PixelEye Complete Workflow Reference

This document is the single developer reference for the PixelEye module in the Invictus app. It covers the working structure, frontend flow, backend flow, API surface, database tables, schedulers, webhook ingestion, notification lifecycle, follow-up workflow, and the functional behavior that connects everything.

## 1. Module Purpose

PixelEye is a tenant-aware CRM and follow-up system for hospital call tracking.

It supports:

- lead capture from frontend forms and Runo webhooks
- lead list management
- overview dashboard analytics
- lead detail review
- five-day follow-up status progression
- manual follow-up scheduling
- reminder notification tracking
- missed follow-up call compliance
- follow-up history audit trail
- CSV and PDF lead export

The central business object is a PixelEye lead. The supporting objects are notification state, follow-up history, call logs, and call compliance rows.

## 2. High-Level Architecture

Frontend:

- React + Vite
- React Router
- React Query
- MUI
- PixelEye UI helpers under `frontend/src/components/sections/pixel-eye`

Backend:

- Express
- Sequelize
- MySQL
- JWT auth
- tenant context middleware
- node-cron schedulers

Data flow:

1. Frontend screens call `/api/v1/pixeleye` endpoints through `_axios`.
2. Backend authenticates the user and attaches tenant context.
3. Controller resolves the tenant/client scope.
4. Service reads or writes PixelEye tables.
5. Notification and compliance services update supporting state.
6. React Query invalidates and refetches active PixelEye views.

## 3. Important Source Files

Frontend entry points:

- `frontend/src/routes/router.tsx`
- `frontend/src/routes/paths.ts`
- `frontend/src/pages/dynamic/index.tsx`
- `frontend/src/pages/pixel-eye/index.tsx`
- `frontend/src/pages/pixel-eye/follow-ups.tsx`
- `frontend/src/pages/pixel-eye/lead-detail.tsx`
- `frontend/src/pages/notifications/NotificationTracker.tsx`
- `frontend/src/pages/notifications/NotificationDetails.tsx`

Frontend PixelEye screens:

- `frontend/src/components/sections/pixel-eye/index.tsx`
- `frontend/src/components/sections/pixel-eye/pixelEyeTable.tsx`
- `frontend/src/components/sections/pixel-eye/PixelEyeLeadDrawer.tsx`
- `frontend/src/components/sections/pixel-eye/PixelEyeDeleteDrawer.tsx`
- `frontend/src/components/sections/pixel-eye-follow-ups/index.tsx`
- `frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`
- `frontend/src/components/sections/pixel-eye-notification-tracker/index.tsx`
- `frontend/src/components/sections/pixel-eye-notification-tracker/NotificationTrackerList.tsx`
- `frontend/src/components/sections/pixel-eye-notification-tracker/NotificationDetailsDrawer.tsx`
- `frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx`

Frontend hooks:

- `frontend/src/components/hooks/usePixelEyeQuery.tsx`
- `frontend/src/components/hooks/usePixelEyeNotificationsQuery.tsx`

Backend module:

- `backend/src/app.js`
- `backend/src/modules/pixelEye/pixelEye.routes.js`
- `backend/src/modules/pixelEye/pixelEye.controller.js`
- `backend/src/modules/pixelEye/pixelEye.service.js`
- `backend/src/modules/pixelEye/pixelEyeNotification.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`
- `backend/src/modules/pixelEye/pixelEyeCallLog.service.js`
- `backend/src/modules/pixelEye/pixelEyeScheduler.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js`
- `backend/src/modules/pixelEye/webhook/pixelEyeWebhook.routes.js`
- `backend/src/modules/pixelEye/webhook/pixelEyeWebhook.controller.js`
- `backend/src/modules/pixelEye/webhook/pixelEyeWebhook.service.js`

Backend database tables:

- `backend/src/database/tables/PixelEyeTable/index.js`
- `backend/src/database/tables/PixelEyeLeadStateTable/index.js`
- `backend/src/database/tables/PixelEyeFollowUpHistoryTable/index.js`
- `backend/src/database/tables/PixelEyeCallLogTable/index.js`
- `backend/src/database/tables/PixelEyeFollowUpCallComplianceTable/index.js`

## 4. Tenant and Client Flow

PixelEye is tenant-aware.

Backend:

- `authenticateToken` validates the JWT.
- `attachTenantContext` attaches `req.tenant`.
- Regular users are scoped to their tenant/client.
- Super-admin users can pass `_client_key` or `client_key` to select a client context.
- PixelEye client keys are normalized through `backend/src/utils/clientKey.js`.

Frontend:

- `useAuth()` gives the logged-in user.
- `normalizeClientKey()` and `resolveClientModuleKey()` normalize URL and user client keys.
- Super-admin routes can use `:clientKey`.
- Regular users mostly use `user.clientKey`.

Common PixelEye client key:

- `pixeleye`

## 5. Frontend Route Map

Routes are wired in `frontend/src/routes/router.tsx` and `frontend/src/routes/paths.ts`.

Main routes:

- `/pages/d/:clientKey/overview`
- `/pages/d/:clientKey/leads`
- `/pages/d/:clientKey/notification-tracker`
- `/pages/d/:clientKey/notification/:notificationId`
- `/pixel-eye/follow-ups`
- `/pixel-eye/leads/:leadId`

Dynamic page routing:

- `tableId === "overview"` renders the PixelEye overview dashboard.
- `tableId === "notification-tracker"` renders the notification tracker.
- any other table id renders a configured dynamic table.

Sidebar navigation:

- `frontend/src/routes/sitemap.ts` adds PixelEye menu items.
- PixelEye menu includes Overview, tables from `ClientRegistry`, Follow-ups, and Notification Tracker.

## 6. Database Structure

### 6.1 PixelEye Leads Table

Model:

- `db.PixelEye`
- source: `backend/src/database/tables/PixelEyeTable/index.js`

Purpose:

- primary CRM lead table
- stores one row per call/lead

Important fields:

- `client_id`
- `date`
- `time`
- `call_id`
- `customer_name`
- `phone_number`
- `agent_name`
- `source`
- `type_of_enquiry`
- `follow_up_date`
- `status`
- `day_1`
- `day_2`
- `day_3`
- `day_4`
- `day_5`
- `created_at`
- `updated_at`

Important constraint:

- unique index on `client_id + call_id`

Status fields use the PixelEye status enum. The same enum is reused for the main `status` and day fields.

### 6.2 PixelEye Lead State Table

Model:

- `db.PixelEyeLeadState`
- source: `backend/src/database/tables/PixelEyeLeadStateTable/index.js`

Purpose:

- tracks reminder/notification lifecycle for each lead
- mirrors selected lead fields so the scheduler can send reminders without reloading the lead every time

Important fields:

- `client_id`
- `call_id`
- `customer_name`
- `phone_number`
- `agent_name`
- `last_status`
- `state`
- `schedule_type`
- `reason`
- `scheduled_at`
- `notification_sent`
- `notification_sent_at`
- `thirty_min_cycle_completed`
- `day1_mode`
- `permanently_closed`
- `cancel_reason`
- `current_day`

Allowed `state` values:

- `new`
- `scheduled`
- `completed`
- `cancelled`
- `baseline`

Allowed `schedule_type` values:

- `THIRTY_MIN`
- `DNP2`
- `TWENTY_FOUR_HR`
- `MANUAL`

Important indexes:

- unique index on `client_id + call_id`
- scheduler index on `state + scheduled_at + notification_sent`

### 6.3 Follow-Up History Table

Model:

- `db.PixelEyeFollowUpHistory`
- source: `backend/src/database/tables/PixelEyeFollowUpHistoryTable/index.js`

Purpose:

- immutable-ish audit log for follow-up date changes and workflow actions

Important fields:

- `client_id`
- `lead_id`
- `call_id`
- `phone_number`
- `customer_name`
- `old_follow_up_date`
- `new_follow_up_date`
- `change_type`
- `reason`
- `changed_by_user_id`
- `changed_by_name`
- `source`
- `created_at`
- `updated_at`

Change types:

- `CREATED`
- `UPDATED`
- `RESCHEDULED`
- `CLEARED`
- `AUTO_FROM_WEBHOOK`
- `MANUAL_FROM_FRONTEND`

Source values:

- `FRONTEND`
- `RUNO_WEBHOOK`
- `SYSTEM`

### 6.4 PixelEye Call Logs Table

Model:

- `db.PixelEyeCallLog`
- source: `backend/src/database/tables/PixelEyeCallLogTable/index.js`

Purpose:

- records call activity received from webhook/system sources
- supports compliance matching

Important fields:

- `client_id`
- `lead_id`
- `call_id`
- `phone_number`
- `normalized_phone_number`
- `customer_name`
- `agent_name`
- `call_date`
- `call_time`
- `call_started_at`
- `status`
- `source`
- `raw_payload`
- `direction`
- `duration_seconds`
- `recording_url`
- `disposition`

Source values:

- `RUNO_WEBHOOK`
- `SYSTEM`

### 6.5 Follow-Up Call Compliance Table

Model:

- `db.PixelEyeFollowUpCallCompliance`
- source: `backend/src/database/tables/PixelEyeFollowUpCallComplianceTable/index.js`

Purpose:

- tracks whether a scheduled follow-up call actually happened inside the allowed window
- powers missed follow-up call workflows

Important fields:

- `client_id`
- `lead_id`
- `call_id`
- `phone_number`
- `normalized_phone_number`
- `customer_name`
- `agent_name`
- `scheduled_follow_up_date`
- `scheduled_follow_up_at`
- `allowed_until`
- `compliance_status`
- `matched_call_log_id`
- `matched_call_id`
- `matched_call_started_at`
- `reason`
- `source`

Compliance statuses:

- `PENDING`
- `CALLED`
- `MISSED`
- `IGNORED`
- `CANCELLED`

Source values:

- `SYSTEM`
- `FRONTEND`
- `RUNO_WEBHOOK`
- `SCHEDULER`

## 7. Backend Startup Flow

Source:

- `backend/src/app.js`

Startup order:

1. Express app is created.
2. Security middleware is attached: Helmet, CORS, JSON parsing, URL encoding, rate limiters.
3. Database sync runs.
4. PixelEye migrations/ensure scripts run:
   - `ensurePixelEyeLeadStateCurrentDayColumn`
   - `ensurePixelEyeLeadStateManualScheduleType`
   - `ensurePixelEyeDnpStatusEnums`
   - `ensurePixelEyeFollowUpHistoryTable`
   - `ensurePixelEyeCallLogTable`
   - `ensurePixelEyeFollowUpCallComplianceTable`
5. PixelEye notification scheduler starts.
6. PixelEye compliance scheduler starts.
7. Routers mount under `/api/v1`.

PixelEye routers:

- webhook router: `/api/v1/pixeleye/webhook`
- authenticated PixelEye router: `/api/v1/pixeleye`

## 8. Backend API Surface

All standard PixelEye APIs are protected by:

- `authenticateToken`
- `attachTenantContext`

Webhook API is protected by:

- rate limit
- security headers
- API key verification
- request logging
- webhook payload validation

### 8.1 Lead APIs

`GET /api/v1/pixeleye`

- controller: `getLeads`
- service: `listPixelEyeLeads`
- returns tenant-scoped lead list
- attaches reminder state and follow-up history summary to rows

`GET /api/v1/pixeleye/export`

- controller: `exportLeads`
- service: `listPixelEyeLeadsForExport`
- supports `format=csv` and `format=pdf`
- supports filters: `dateFrom`, `dateTo`, `agent`

`GET /api/v1/pixeleye/:id`

- controller: `getLeadById`
- service: `getPixelEyeLead`
- returns one tenant-scoped lead

`POST /api/v1/pixeleye`

- controller: `createLead`
- validation: `validatePixelEyeCreate`
- service: `createPixelEyeLead`
- creates a lead, schedules reminder state if needed, and writes history/compliance as applicable

`PATCH /api/v1/pixeleye/:id`

- controller: `updateLead`
- validation: `validatePixelEyeUpdate`
- service: `updatePixelEyeLead`
- updates lead fields
- status/day updates can create, update, schedule, cancel, or complete reminder state

`DELETE /api/v1/pixeleye/:id`

- controller: `deleteLead`
- service: `deletePixelEyeLead`
- deletes tenant-scoped lead

### 8.2 Follow-Up Action APIs

`PATCH /api/v1/pixeleye/:id/follow-up/handled`

- controller: `markLeadFollowUpHandled`
- service: `markPixelEyeFollowUpHandled`
- marks the active reminder state as completed
- writes follow-up history

`PATCH /api/v1/pixeleye/:id/follow-up/reschedule`

- controller: `rescheduleLeadFollowUp`
- service: `reschedulePixelEyeFollowUp`
- required payload: `follow_up_date`
- optional payload: `reason`
- updates lead `follow_up_date`
- schedules `MANUAL` reminder state
- creates/updates pending follow-up compliance
- writes follow-up history

`PATCH /api/v1/pixeleye/:id/follow-up/cancel`

- controller: `cancelLeadFollowUp`
- service: `cancelPixelEyeFollowUp`
- optional payload: `status`, `reason`
- marks reminder state as cancelled
- may permanently close the reminder pipeline depending on status/reason

`GET /api/v1/pixeleye/:id/follow-up/history`

- controller: `getLeadFollowUpHistory`
- service: `getFollowUpHistoryForLead`
- returns audit history for one lead

### 8.3 Notification APIs

`GET /api/v1/pixeleye/notifications`

- controller: `getNotifications`
- service: `listNotificationStates`
- returns reminder state rows
- supports tenant/client filtering

`GET /api/v1/pixeleye/notifications/summary`

- controller: `getNotificationsSummary`
- service: `getNotificationSummary`
- returns counts for scheduled, completed, cancelled, and total states

### 8.4 Compliance APIs

`GET /api/v1/pixeleye/follow-ups/call-compliance`

- controller: `getFollowUpCallCompliance`
- service: `listFollowUpCallCompliance`
- returns compliance rows
- supports filters such as `compliance_status`, date range, agent, and limit

`GET /api/v1/pixeleye/follow-ups/missed-calls`

- controller: `getMissedFollowUpCalls`
- service: `listMissedFollowUpCalls`
- returns rows with missed follow-up call compliance

`GET /api/v1/pixeleye/follow-ups/call-compliance-summary`

- controller: `getFollowUpCallComplianceSummary`
- service: `getFollowUpCallComplianceSummary`
- returns compliance aggregate counts

### 8.5 Webhook API

`POST /api/v1/pixeleye/webhook`

- route: `backend/src/modules/pixelEye/webhook/pixelEyeWebhook.routes.js`
- controller: `createPixelEyeWebhook`
- service: `processPixelEyeWebhook`

Webhook middleware:

- rate limit: default 60 requests per minute unless `RUNO_WEBHOOK_RATE_LIMIT_MAX` overrides it
- security headers
- API key verification
- request logging
- payload validation

Webhook behavior:

1. Normalize incoming Runo payload.
2. Resolve client context.
3. Create or update PixelEye lead by client and call id.
4. Persist call log.
5. Update notification state based on status/follow-up date.
6. Create follow-up history when follow-up date changes.
7. Create or update follow-up call compliance for pending manual follow-ups.
8. If an incoming call log matches pending compliance, mark it as called.

## 9. Notification Scheduling Logic

Source:

- `backend/src/modules/pixelEye/pixelEyeNotification.service.js`
- `backend/src/modules/pixelEye/pixelEyeScheduler.js`

Scheduler:

- runs every minute
- calls `sendDueNotifications()`
- guarded against overlapping runs
- warns on event-loop lag

Status category mapping:

- `THIRTY_MIN`: short callback statuses such as Busy, Not Answering, Switched Off, Missed Call, DND, etc.
- `DNP2`: Dnp 1 through Dnp 4
- `TWENTY_FOUR_HR`: Enquiry, Hot Follow-up, Follow-up Required, Will Call Later, Rescheduling, Doctor Time, Appointment Cancelled, Address Requested, Others, etc.
- `TERMINATION`: terminal statuses such as Wrong Number, Fraud Call, Not Interested, Closed, Walk-in, etc.
- `NO_ACTION`: Appointment Fixed and Visited
- `UNKNOWN`: no recognized scheduling category

Scheduling rules:

- `THIRTY_MIN` statuses schedule a 30-minute reminder.
- `DNP2` statuses schedule a 24-hour reminder.
- `TWENTY_FOUR_HR` statuses schedule a 24-hour reminder.
- `MANUAL` reminders are scheduled from `follow_up_date`.
- terminal statuses cancel reminders permanently.
- no-action statuses stop scheduling because the outcome is already successful.

Manual follow-up date handling:

- date-only input is scheduled for 9:00 AM IST on that date
- date-time input is parsed as a direct scheduled timestamp
- dates in the past are rejected

Notification send behavior:

- due rows are found from `PixelEyeLeadState`
- notifications are retried within a two-hour retry window
- `notification_sent` and `notification_sent_at` are updated after successful send
- state progression is updated by the service

## 10. Follow-Up Compliance Logic

Source:

- `backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js`

Scheduler:

- runs every 15 minutes
- calls `processDuePendingComplianceBatch({ limit: 50 })`
- marks overdue pending rows as called, missed, ignored, or cancelled

Compliance lifecycle:

1. A follow-up date is created or rescheduled.
2. `createOrUpdatePendingFollowUpCompliance()` creates/updates a `PENDING` row.
3. The webhook stores incoming call logs.
4. `findPendingComplianceForCallLog()` tries to match call logs to pending compliance.
5. If a call happened in the allowed window, `markComplianceAsCalled()` marks the row `CALLED`.
6. If the allowed window passes with no matching call, the scheduler marks it `MISSED`.
7. If reminder state is cancelled or permanently closed, the compliance row can become `CANCELLED` or `IGNORED`.
8. Missed rows are shown in the frontend follow-ups page.

## 11. Frontend API Hooks

Source:

- `frontend/src/components/hooks/usePixelEyeQuery.tsx`
- `frontend/src/components/hooks/usePixelEyeNotificationsQuery.tsx`

Lead hooks:

- `usePixelEyeQuery(clientKey)`
- `usePixelEyeLeadQuery(leadId, clientKey)`
- `usePixelEyeMissedFollowUpsQuery(clientKey)`

Lead mutations:

- `useCreatePixelEyeMutation()`
- `useUpdatePixelEyeMutation()`
- `useDeletePixelEyeMutation()`
- `useMarkPixelEyeFollowUpHandledMutation()`
- `useReschedulePixelEyeFollowUpMutation()`
- `useCancelPixelEyeFollowUpMutation()`

Notification hooks:

- `usePixelEyeNotificationsQuery(clientKey, filters)`
- `usePixelEyeNotificationsSummaryQuery(clientKey)`

React Query invalidation:

- lead mutations invalidate `pixelEyeLeads`
- action mutations invalidate/refetch PixelEye lead data
- notification hooks auto-refresh every 30 seconds

## 12. Frontend Workflows

### 12.1 Main Lead List

Entry:

- `frontend/src/components/sections/pixel-eye/index.tsx`

Route:

- `/pages/d/:clientKey/leads`

Purpose:

- manage lead records
- add/edit/delete rows
- update follow-up date inline
- update status/day values
- search, filter, and export
- navigate to lead detail

Flow:

1. Resolve active client key.
2. Fetch leads via `usePixelEyeQuery`.
3. Render `PixelEyePageShell`, `PixelEyePageHeader`, filters, action buttons, and `PixelEyeTable`.
4. Create/edit uses `PixelEyeLeadDrawer`.
5. Delete uses `PixelEyeDeleteDrawer`.
6. Inline follow-up date changes call `PATCH /pixeleye/:id`.
7. Row detail navigation goes to `/pixel-eye/leads/:leadId`.

### 12.2 Overview Dashboard

Entry:

- `frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx`

Route:

- `/pages/d/:clientKey/overview`

Purpose:

- show operational metrics
- show trend charts
- show funnel data
- show follow-up summary panels

Flow:

1. Dynamic page detects `tableId === "overview"`.
2. PixelEye dashboard fetches `GET /pixeleye`.
3. Dashboard utilities derive metrics from the current lead list.
4. Filters narrow the dashboard in memory.
5. Dark dashboard widgets render KPIs, charts, and follow-up panels.

### 12.3 Follow-Ups Queue

Entry:

- `frontend/src/components/sections/pixel-eye-follow-ups/index.tsx`

Route:

- `/pixel-eye/follow-ups`

Purpose:

- work active follow-up queue
- review missed follow-up calls
- reschedule reminders
- cancel reminders
- mark follow-ups handled

Flow:

1. Fetch all PixelEye leads.
2. Fetch missed follow-up compliance rows.
3. Convert leads and missed rows into display items.
4. Build buckets such as all, overdue, today, tomorrow, week, and missed.
5. User selects a bucket and lead.
6. User can:
   - mark handled
   - reschedule
   - cancel
   - inspect details
7. Mutations update backend state and refetch the queue.

### 12.4 Lead Detail

Entry:

- `frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`

Route:

- `/pixel-eye/leads/:leadId`

Purpose:

- inspect one lead deeply
- manage five-day follow-up progression
- see audit history
- see call compliance
- run follow-up actions

Flow:

1. Read `leadId` from route.
2. Fetch lead through `usePixelEyeLeadQuery`.
3. Fetch follow-up history through `GET /pixeleye/:id/follow-up/history`.
4. Fetch call compliance through `GET /pixeleye/follow-ups/call-compliance`.
5. Render header, pipeline cards, details, history, compliance, and action dialogs.
6. Day status edits call `PATCH /pixeleye/:id`.
7. Reschedule, handled, and cancel actions call follow-up action endpoints.
8. On success, lead, history, and compliance data are refreshed.

### 12.5 Notification Tracker

Entry:

- `frontend/src/components/sections/pixel-eye-notification-tracker/index.tsx`
- `frontend/src/pages/notifications/NotificationTracker.tsx`

Route:

- `/pages/d/:clientKey/notification-tracker`

Purpose:

- monitor reminder state
- filter by state, type, and date
- review notification counts
- inspect notification details

Flow:

1. Resolve tenant client key.
2. Fetch notification rows with `usePixelEyeNotificationsQuery`.
3. Fetch summary with `usePixelEyeNotificationsSummaryQuery`.
4. Apply local filters for state, schedule type, date range, and search.
5. Render summary cards and `NotificationTrackerList`.
6. Selecting a row opens `NotificationDetailsDrawer`.

### 12.6 Notification Details Route

Entry:

- `frontend/src/pages/notifications/NotificationDetails.tsx`

Route:

- `/pages/d/:clientKey/notification/:notificationId`

Purpose:

- show a full notification state record
- display raw JSON for troubleshooting

Flow:

1. Fetch notification list for client.
2. Find matching notification by id.
3. Render general info, timeline, raw state data, and placeholder action buttons.

## 13. Backend Service Workflows

### 13.1 Lead Creation

Function:

- `createPixelEyeLead`

Flow:

1. Resolve tenant client id.
2. Validate unique `client_id + call_id`.
3. Create lead row.
4. Evaluate status through notification service.
5. If `follow_up_date` exists, schedule manual reminder.
6. Create pending compliance if the follow-up date requires a future call.
7. Write follow-up history when applicable.
8. Return created lead.

### 13.2 Lead Update

Function:

- `updatePixelEyeLead`

Flow:

1. Find tenant-safe lead.
2. Prevent invalid day progression when previous days are terminal.
3. Update lead row.
4. If main status changed, call `processLeadStatus`.
5. If a day field changed, call `processDayStatus`.
6. If `follow_up_date` changed, schedule/cancel manual reminder as needed.
7. Update compliance and history when follow-up date changes.
8. Return updated lead.

### 13.3 Follow-Up Reschedule

Function:

- `reschedulePixelEyeFollowUp`

Flow:

1. Load tenant-safe lead.
2. Reject terminal or permanently closed leads.
3. Validate future `follow_up_date`.
4. Update lead `follow_up_date`.
5. Schedule `MANUAL` reminder state.
6. Create or update pending compliance.
7. Write `RESCHEDULED` follow-up history.
8. Return updated lead and reminder state.

### 13.4 Follow-Up Cancel

Function:

- `cancelPixelEyeFollowUp`

Flow:

1. Load tenant-safe lead.
2. Optionally update lead status.
3. Determine whether the lead should be permanently closed.
4. Update or create lead state as `cancelled`.
5. Store cancel reason.
6. Return updated lead and reminder state.

### 13.5 Follow-Up Handled

Function:

- `markPixelEyeFollowUpHandled`

Flow:

1. Load tenant-safe lead.
2. Find active scheduled reminder state.
3. Mark reminder state `completed`.
4. Write history with actor/source.
5. Return updated state.

## 14. Webhook Workflow

Source:

- `backend/src/modules/pixelEye/webhook/pixelEyeWebhook.service.js`

Flow:

1. Runo calls `POST /api/v1/pixeleye/webhook`.
2. Middleware validates API key and payload.
3. Payload is normalized into PixelEye fields.
4. Client context is resolved.
5. Existing lead is found by `client_id + call_id`.
6. Existing lead is updated or a new lead is created.
7. Call log is persisted.
8. If the lead has a follow-up date, manual reminder scheduling is attempted.
9. Follow-up history is created when the follow-up date is new or changed.
10. Pending compliance is created/updated for the follow-up date.
11. Incoming call log is matched against pending compliance.
12. Response returns action and lead id/call id.

## 15. End-to-End Functional Scenarios

### Scenario A: User creates a lead manually

1. User opens PixelEye Leads.
2. User submits `PixelEyeLeadDrawer`.
3. Frontend calls `POST /api/v1/pixeleye`.
4. Backend creates lead.
5. Backend evaluates status and follow-up date.
6. If follow-up is scheduled, `PixelEyeLeadState` and compliance rows are created.
7. Frontend refetches leads.

### Scenario B: Runo webhook creates or updates a lead

1. Runo sends webhook.
2. Backend validates webhook.
3. Lead is upserted by tenant and call id.
4. Call log is stored.
5. Notification state, follow-up history, and compliance are updated.
6. Frontend sees updated data on refetch.

### Scenario C: User sets a follow-up date

1. User edits `follow_up_date` in lead table/detail/follow-up queue.
2. Frontend calls `PATCH /api/v1/pixeleye/:id` or reschedule endpoint.
3. Backend validates the date.
4. Backend schedules a `MANUAL` reminder.
5. Backend creates pending compliance.
6. Backend writes follow-up history.
7. Scheduler sends notification when due.

### Scenario D: User updates Day 1 through Day 5

1. User edits a day field on lead detail.
2. Frontend calls `PATCH /api/v1/pixeleye/:id`.
3. Backend validates day progression.
4. `processDayStatus` determines status category.
5. Backend schedules next reminder, creates baseline state, or cancels workflow.
6. Frontend refetches lead, history, and compliance.

### Scenario E: Reminder notification fires

1. `pixelEyeScheduler` runs every minute.
2. `sendDueNotifications` finds due scheduled states.
3. Notification is sent to configured channel.
4. State row updates `notification_sent` and `notification_sent_at`.
5. Notification tracker reflects the sent state on next refresh.

### Scenario F: Follow-up call is missed

1. Pending compliance row reaches `allowed_until`.
2. Compliance scheduler runs every 15 minutes.
3. No matching call log is found.
4. Row becomes `MISSED`.
5. Follow-ups page shows it under missed follow-up calls.

### Scenario G: Follow-up call is completed

1. Runo webhook sends call log.
2. Backend persists call log.
3. Compliance service finds matching pending compliance.
4. Compliance row becomes `CALLED`.
5. Missed bucket does not show that row.

### Scenario H: User cancels follow-up

1. User opens cancel action from follow-up page or detail page.
2. Frontend calls `PATCH /api/v1/pixeleye/:id/follow-up/cancel`.
3. Backend updates lead state to `cancelled`.
4. Backend may permanently close the pipeline.
5. Frontend removes or de-emphasizes the row after refetch.

## 16. Status and Scheduling Rules

Short callback statuses:

- Busy
- Not Answering
- Switched Off
- Missed Call
- On Another Call
- DND
- Not Speaking
- Disconnecting
- Not in Network
- Incoming Call Not Available

DNP statuses:

- Dnp 1
- Dnp 2
- Dnp 3
- Dnp 4

Twenty-four-hour follow-up statuses:

- Enquiry
- Hot Follow-up
- Follow-up Required
- Will Call Later
- Rescheduling
- Doctor Time
- Follow-up Post Appointment
- Want to Speak With Doctor
- Appointment Cancelled
- Address Requested
- Searching for Specific Hospital
- Others

Terminal statuses:

- Wrong Number
- Wrongly Dialed
- Fraud Call
- Not Interested
- Not Willing to Come Now
- Going to Other Hospital
- Not in Hyderabad
- Long Distance
- Number Not in Service
- Walk-in
- Closed

No-action success statuses:

- Appointment Fixed
- Visited

## 17. Data Ownership Rules

Lead table owns:

- core CRM values
- call identity
- customer/agent details
- main status
- day fields
- follow-up date

Lead state table owns:

- reminder lifecycle
- schedule type
- scheduled notification time
- sent/not sent state
- cancellation/permanent close state

Follow-up history owns:

- audit trail for follow-up changes
- actor/source/reason

Call log table owns:

- raw and normalized call events
- call timestamps and metadata

Compliance table owns:

- expected follow-up call window
- called/missed/ignored/cancelled status
- matching call-log reference

## 18. Current Known Implementation Notes

- `PixelEyeLeadState.day1_mode` exists, but the current notification service disables automatic Day 1 mirroring; agents control Day 1 manually.
- Manual date-only follow-ups are normalized to 9:00 AM IST.
- Notifications and notification summaries auto-refresh every 30 seconds on the frontend.
- Scheduler sends due notifications every minute.
- Compliance scheduler checks due pending rows every 15 minutes.
- Webhook route bypasses the general API limiter but has its own webhook rate limiter.
- Super-admin client switching depends on `_client_key`/`client_key` and client-key normalization.

## 19. Quick API Checklist

Lead management:

- `GET /api/v1/pixeleye`
- `GET /api/v1/pixeleye/export`
- `GET /api/v1/pixeleye/:id`
- `POST /api/v1/pixeleye`
- `PATCH /api/v1/pixeleye/:id`
- `DELETE /api/v1/pixeleye/:id`

Follow-up actions:

- `PATCH /api/v1/pixeleye/:id/follow-up/handled`
- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`
- `GET /api/v1/pixeleye/:id/follow-up/history`

Notifications:

- `GET /api/v1/pixeleye/notifications`
- `GET /api/v1/pixeleye/notifications/summary`

Compliance:

- `GET /api/v1/pixeleye/follow-ups/call-compliance`
- `GET /api/v1/pixeleye/follow-ups/missed-calls`
- `GET /api/v1/pixeleye/follow-ups/call-compliance-summary`

Webhook:

- `POST /api/v1/pixeleye/webhook`

## 20. Developer Checklist For PixelEye Changes

When changing PixelEye, check these areas:

- route entry: `frontend/src/routes/router.tsx`
- path constants: `frontend/src/routes/paths.ts`
- sidebar sitemap: `frontend/src/routes/sitemap.ts`
- client config: `frontend/src/config/clients.ts`
- PixelEye hooks: `frontend/src/components/hooks/usePixelEyeQuery.tsx`
- notification hooks: `frontend/src/components/hooks/usePixelEyeNotificationsQuery.tsx`
- backend routes: `backend/src/modules/pixelEye/pixelEye.routes.js`
- backend controller: `backend/src/modules/pixelEye/pixelEye.controller.js`
- backend service: `backend/src/modules/pixelEye/pixelEye.service.js`
- notification service: `backend/src/modules/pixelEye/pixelEyeNotification.service.js`
- compliance service: `backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`
- database tables and migrations under `backend/src/database`
- frontend lead list, follow-ups, lead detail, overview, and notification tracker screens

Minimum verification after changes:

- lead list loads for PixelEye tenant
- create lead works
- update lead works
- follow-up date schedules reminder
- reschedule follow-up works
- cancel follow-up works
- mark handled works
- lead detail loads history and compliance
- follow-ups page shows active and missed buckets
- notification tracker shows rows and summary cards
- webhook accepts valid payload and rejects invalid/unauthorized payload
- scheduler does not throw on startup

