# PixelEye Full Workflow

This document describes the full PixelEye workflow across the frontend pages, the backend APIs, and the shared data structures that connect them.

## 1. Scope

PixelEye is split into multiple user-facing pages:

1. Main CRM list page
2. Overview dashboard page
3. Follow-ups page
4. Lead detail page
5. Notification tracker page

Each page uses the same PixelEye backend source of truth and the same tenant-aware client key model.

## 2. Shared Structure

### Frontend entry points

- [`frontend/src/pages/pixel-eye/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/index.tsx)
- [`frontend/src/pages/dynamic/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/dynamic/index.tsx)
- [`frontend/src/pages/pixel-eye/follow-ups.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/follow-ups.tsx)
- [`frontend/src/pages/pixel-eye/lead-detail.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/lead-detail.tsx)

### Shared PixelEye UI

- [`frontend/src/components/sections/pixel-eye/pixelEyeUi.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye/pixelEyeUi.tsx)
- [`frontend/src/components/sections/pixel-eye/pixelEyeThemeStyles.ts`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye/pixelEyeThemeStyles.ts)
- [`frontend/src/components/sections/pixel-eye/pixelEyeStatuses.ts`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye/pixelEyeStatuses.ts)

### Shared hooks

- [`frontend/src/components/hooks/usePixelEyeQuery.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/hooks/usePixelEyeQuery.tsx)
- [`frontend/src/components/hooks/usePixelEyeNotificationsQuery.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/hooks/usePixelEyeNotificationsQuery.tsx)

### Shared backend module

- [`backend/src/modules/pixelEye/pixelEye.routes.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.routes.js)
- [`backend/src/modules/pixelEye/pixelEye.controller.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.controller.js)
- [`backend/src/modules/pixelEye/pixelEye.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.service.js)
- [`backend/src/modules/pixelEye/pixelEyeNotification.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeNotification.service.js)
- [`backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js)
- [`backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js)
- [`backend/src/modules/pixelEye/pixelEyeScheduler.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeScheduler.js)
- [`backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeFollowUpComplianceScheduler.js)

## 3. Route Map

The PixelEye frontend routes are wired in:

- [`frontend/src/routes/router.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/routes/router.tsx)
- [`frontend/src/routes/paths.ts`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/routes/paths.ts)

Important routes:

- `GET /pages/d/:clientKey/overview`
- `GET /pages/d/:clientKey/:tableId`
- `GET /pages/d/:clientKey/leads`
- `GET /pixel-eye/follow-ups`
- `GET /pixel-eye/leads/:leadId`

The dynamic route chooses between:

- `overview` -> PixelEye dashboard metrics
- `notification-tracker` -> notification tracker view
- any other table id -> dynamic table rendering

## 4. Page Workflows

### 4.1 Main CRM List Page

Entry point:

- [`frontend/src/components/sections/pixel-eye/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye/index.tsx)

Route:

- `GET /pages/d/:clientKey/leads`

Purpose:

- manage the core PixelEye lead list
- create new leads
- update existing leads
- delete leads
- search and filter the current lead set
- export filtered leads to CSV or PDF
- navigate into the lead detail page

Workflow:

1. The page reads the current tenant/client from auth state and the URL.
2. It fetches the lead list through `usePixelEyeQuery`.
3. It renders the table, search box, status filter, date range controls, and export actions.
4. The user can open the add/edit drawer to create or update a lead.
5. The user can delete a lead through the delete drawer.
6. Inline edits update status, day fields, and follow-up date.
7. The page refetches after mutations to keep the table current.
8. The row click can open the lead detail page when navigation is enabled.

Important UI pieces:

- `PixelEyeTable`
- `PixelEyeLeadDrawer`
- `PixelEyeDeleteDrawer`
- `PixelEyeCard`
- `PixelEyePageHeader`
- `PixelEyePageShell`

Backend endpoints used:

- `GET /api/v1/pixeleye`
- `POST /api/v1/pixeleye`
- `PATCH /api/v1/pixeleye/:id`
- `DELETE /api/v1/pixeleye/:id`

### 4.2 Overview Dashboard Page

Entry points:

- [`frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye-overview/DashboardPage.tsx)
- [`frontend/src/components/sections/pixel-eye-overview/dark/OverviewDashboard.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye-overview/dark/OverviewDashboard.tsx)

Mounted through:

- [`frontend/src/pages/dynamic/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/dynamic/index.tsx)

Route:

- `GET /pages/d/:clientKey/overview`

Purpose:

- show live lead analytics
- show follow-up buckets
- show trend charts and KPI summaries
- provide filtering by date and agent

Workflow:

1. `DashboardPage.tsx` fetches the PixelEye lead list from `GET /api/v1/pixeleye`.
2. The page stores filter state for date range and agent selection.
3. `applyDashboardFilters()` narrows the current lead set.
4. `buildDashboardMetrics()` computes KPIs, trend data, status breakdowns, funnel data, and follow-up groups.
5. `OverviewDashboard.tsx` lays out the cards, charts, and filter controls.
6. The dark subcomponents render the actual dashboard widgets:
   - `KPIStrip`
   - `SalesOverview`
   - `MiniStats`
   - `TrendChart`
   - `TotalProfitChart`
   - `FollowUpPanel`
7. The user can filter the dashboard without changing the backend data.

Important UI pieces:

- `PageHeader`
- `FilterBar`
- `KPIStrip`
- `SalesOverview`
- `MiniStats`
- `TrendChart`
- `TotalProfitChart`
- `FollowUpPanel`
- `RightPanel`

Backend endpoints used:

- `GET /api/v1/pixeleye`

### 4.3 Follow-Ups Page

Entry points:

- [`frontend/src/components/sections/pixel-eye-follow-ups/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye-follow-ups/index.tsx)
- [`frontend/src/pages/pixel-eye/follow-ups.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/follow-ups.tsx)

Route:

- `GET /pixel-eye/follow-ups`

Purpose:

- show active follow-up buckets
- show missed follow-up calls
- search within the selected bucket
- mark a follow-up as handled
- reschedule follow-ups
- cancel or close follow-ups
- keep the follow-up queue in sync with the backend

Workflow:

1. The page loads the lead list and the missed follow-up rows.
2. `buildFollowUpPageBuckets()` groups the lead set into overdue, today, tomorrow, week, and all buckets.
3. The page merges in missed follow-up call rows as a special bucket.
4. The user can switch between bucket tabs.
5. Search filters the visible bucket in memory.
6. Selecting a lead shows the detail panel.
7. The user can mark a lead handled, reschedule the reminder, or cancel the follow-up.
8. Each mutation triggers a refetch so the bucket counts stay accurate.

Important UI pieces:

- `PixelEyePageShell`
- `PixelEyeCard`
- `FilterBar`-style field helpers from `pixelEyeUi.tsx`
- bucket tabs
- lead summary panel
- reschedule drawer
- cancel drawer

Backend endpoints used:

- `GET /api/v1/pixeleye`
- `GET /api/v1/pixeleye/follow-ups/missed-calls`
- `PATCH /api/v1/pixeleye/:id/follow-up/handled`
- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`

### 4.4 Lead Detail Page

Entry points:

- [`frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye-lead-detail/index.tsx)
- [`frontend/src/pages/pixel-eye/lead-detail.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/lead-detail.tsx)

Route:

- `GET /pixel-eye/leads/:leadId`

Purpose:

- inspect one lead in detail
- edit the lead status
- update day-based pipeline fields
- copy contact details
- review follow-up history
- review call compliance matches
- reschedule, handle, or cancel the active reminder

Workflow:

1. The route parameter `leadId` is read from the URL.
2. The page normalizes the current client key.
3. `usePixelEyeLeadQuery()` fetches the lead.
4. Separate queries load follow-up history and call compliance rows.
5. The page renders the hero summary, overview grid, pipeline days, history, and compliance monitor.
6. The user can update the lead status inline.
7. The user can update day 1 through day 5 outcomes.
8. The user can reschedule the reminder, mark it handled, or cancel it.
9. After every mutation, the page refetches lead, history, and compliance data.

Important UI pieces:

- `PixelEyePageShell`
- `PixelEyeCard`
- reschedule dialog
- handled dialog
- cancel dialog
- history summary
- compliance summary

Backend endpoints used:

- `GET /api/v1/pixeleye/:id`
- `GET /api/v1/pixeleye/:id/follow-up/history`
- `PATCH /api/v1/pixeleye/:id`
- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- `PATCH /api/v1/pixeleye/:id/follow-up/handled`
- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`
- `GET /api/v1/pixeleye/follow-ups/call-compliance`

### 4.5 Notification Tracker Page

Entry point:

- `frontend/src/pages/dynamic/index.tsx`

Route:

- `GET /pages/d/:clientKey/notification-tracker`

Purpose:

- inspect notification state and reminder tracking
- review which follow-up reminders are active, pending, or completed

Workflow:

1. The dynamic page detects `tableId === 'notification-tracker'`.
2. It renders `NotificationTracker`.
3. The tracker fetches notification rows and summary data.
4. The user reviews reminder status without editing the core lead row.

Backend endpoints used:

- `GET /api/v1/pixeleye/notifications`
- `GET /api/v1/pixeleye/notifications/summary`

## 5. Backend Workflow

### Request lifecycle

1. The frontend calls the PixelEye API through `_axios`.
2. Authentication middleware validates the session.
3. Tenant middleware attaches the client context.
4. The controller validates the request and forwards it to the service layer.
5. The service layer reads or updates the relevant database tables.
6. The controller returns the result to the frontend.
7. The frontend refetches the current query to keep UI state fresh.

### Lead create/update lifecycle

1. The main page submits lead data.
2. `pixelEye.service.js` resolves the correct client context.
3. The lead is created or updated in the `PixelEye` table.
4. Follow-up history can be recorded when reminder dates change.
5. The overview dashboard and follow-up pages pick up the new lead state on the next query refresh.

### Follow-up lifecycle

1. A lead gets a reminder schedule.
2. The notification service stores or updates state in `PixelEyeLeadState`.
3. The scheduler checks due reminders on a timer.
4. Due items are sent out as notifications.
5. When the reminder is handled, rescheduled, or cancelled, the state row is updated.

### Compliance lifecycle

1. The compliance service maps reminders to actual call log rows.
2. The follow-ups page reads the compliance rows.
3. Missed call rows are exposed separately for the missed follow-up bucket.

## 6. Database Structure

Main tables involved:

- `PixelEye`
- `PixelEyeLeadState`
- `PixelEyeFollowUpHistory`
- `PixelEyeCallLog`
- `PixelEyeFollowUpCallCompliance`

The backend boot sequence ensures the required tables and migrations are available before serving requests.

## 7. Page-to-Backend Matrix

### Main CRM list page

- Load leads: `GET /api/v1/pixeleye`
- Create lead: `POST /api/v1/pixeleye`
- Update lead: `PATCH /api/v1/pixeleye/:id`
- Delete lead: `DELETE /api/v1/pixeleye/:id`

### Overview dashboard

- Load metrics source: `GET /api/v1/pixeleye`

### Follow-ups page

- Load leads: `GET /api/v1/pixeleye`
- Load missed calls: `GET /api/v1/pixeleye/follow-ups/missed-calls`
- Handle reminder: `PATCH /api/v1/pixeleye/:id/follow-up/handled`
- Reschedule reminder: `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- Cancel reminder: `PATCH /api/v1/pixeleye/:id/follow-up/cancel`

### Lead detail page

- Load lead: `GET /api/v1/pixeleye/:id`
- Load history: `GET /api/v1/pixeleye/:id/follow-up/history`
- Load compliance: `GET /api/v1/pixeleye/follow-ups/call-compliance`
- Edit status or day fields: `PATCH /api/v1/pixeleye/:id`

### Notification tracker

- Notifications: `GET /api/v1/pixeleye/notifications`
- Summary: `GET /api/v1/pixeleye/notifications/summary`

## 8. Structure Summary

The PixelEye app is organized around one shared CRM model:

- the main list page manages the full lead table
- the overview dashboard turns the lead set into analytics
- the follow-ups page turns the same data into actionable buckets
- the lead detail page shows and edits one lead at a time
- the notification tracker shows reminder delivery state

The backend keeps the data synchronized through:

- route handlers
- business services
- follow-up history
- compliance rows
- schedulers

## 9. Short Version

If you want the short version:

1. Main page manages all leads.
2. Overview page shows analytics from the same lead list.
3. Follow-ups page groups leads into action buckets.
4. Lead detail page edits one lead and its reminder state.
5. Notification tracker shows reminder delivery state.
6. Backend services and schedulers keep all of it in sync.
