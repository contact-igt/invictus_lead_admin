# PixelEye Lead Detail Page Architecture

This document explains the PixelEye lead detail page end to end: frontend structure, backend structure, route flow, and the data workflow that powers the page.

## 1. Purpose

The PixelEye lead detail page is the per-lead CRM view used to inspect and update a single lead.

It supports:

- viewing lead metadata
- editing the main lead status
- rescheduling follow-ups
- marking follow-ups as handled
- closing or cancelling follow-ups
- reviewing follow-up history
- reviewing call compliance matches

## 2. Frontend Structure

### Main entry points

- [`frontend/src/pages/pixel-eye/lead-detail.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/pages/pixel-eye/lead-detail.tsx)
- [`frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye-lead-detail/index.tsx)

### Route wiring

The page is mounted through the app router in:

- [`frontend/src/routes/router.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/routes/router.tsx)
- [`frontend/src/routes/paths.ts`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/routes/paths.ts)

The route constant is:

- `pixel-eye/leads/:leadId`

The page component wraps the detail UI in a `Stack` and renders:

- `PixelEyeLeadDetailPage`

### Component responsibilities

The main detail component handles:

- loading the selected lead
- showing summary cards and status chips
- rendering the lead timeline and pipeline day fields
- opening action dialogs
- syncing updates back to the backend
- refreshing lead data after each action

### Shared UI primitives

The page reuses the shared PixelEye shell and card system:

- [`frontend/src/components/sections/pixel-eye/pixelEyeUi.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/sections/pixel-eye/pixelEyeUi.tsx)

Important shared pieces:

- `PixelEyePageShell`
- `PixelEyeCard`
- `getDialogPaperSx`
- `getFieldSx`
- `getMenuProps`

### Data hooks

The component reads and mutates data through:

- [`frontend/src/components/hooks/usePixelEyeQuery.tsx`](/d:/INVICTUS%20BACKEND/Invictus/frontend/src/components/hooks/usePixelEyeQuery.tsx)

Relevant hooks:

- `usePixelEyeLeadQuery`
- `useReschedulePixelEyeFollowUpMutation`
- `useCancelPixelEyeFollowUpMutation`
- `useUpdatePixelEyeMutation`

### UI sections in the page

The page is organized into these visible blocks:

1. Header and back navigation
2. Lead profile summary
3. Main action buttons
4. Overview grid of lead metadata
5. Pipeline day progress cards
6. History / audit trail
7. Call compliance section
8. Reschedule dialog
9. Cancel / close dialog

## 3. Backend Structure

### App registration

The PixelEye module is mounted in:

- [`backend/src/app.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/app.js)

The app registers:

- `PixelEyeWebhookRouter`
- `PixelEyeRouter`
- PixelEye schedulers
- PixelEye migrations

### API route file

The main route map is:

- [`backend/src/modules/pixelEye/pixelEye.routes.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.routes.js)

The lead detail page uses these routes:

- `GET /api/v1/pixeleye/:id`
- `GET /api/v1/pixeleye/:id/follow-up/history`
- `PATCH /api/v1/pixeleye/:id`
- `PATCH /api/v1/pixeleye/:id/follow-up/reschedule`
- `PATCH /api/v1/pixeleye/:id/follow-up/cancel`

It also depends on supporting list endpoints for related data:

- `GET /api/v1/pixeleye/follow-ups/call-compliance`
- `GET /api/v1/pixeleye/follow-ups/missed-calls`

### Controller layer

The controller file is:

- [`backend/src/modules/pixelEye/pixelEye.controller.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.controller.js)

The controller handles:

- response shaping
- client context validation
- status code mapping
- export support
- history lookup
- follow-up handling actions

### Service layer

The detail page depends on the service layer for the actual business rules:

- [`backend/src/modules/pixelEye/pixelEye.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEye.service.js)
- [`backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js)
- [`backend/src/modules/pixelEye/pixelEyeNotification.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeNotification.service.js)
- [`backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js)

These services are responsible for:

- loading a single lead by ID
- updating lead fields
- rescheduling a follow-up
- marking a follow-up as handled
- cancelling a follow-up
- recording history rows
- returning compliance rows

## 4. Data Model

The page reads from and writes to these main tables:

- `PixelEye`
- `PixelEyeLeadState`
- `PixelEyeFollowUpHistory`
- `PixelEyeCallLog`
- `PixelEyeFollowUpCallCompliance`

Relevant migration files:

- [`backend/src/database/migrations/ensurePixelEyeLeadStateCurrentDay.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeLeadStateCurrentDay.js)
- [`backend/src/database/migrations/ensurePixelEyeLeadStateScheduleTypeManual.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeLeadStateScheduleTypeManual.js)
- [`backend/src/database/migrations/ensurePixelEyeDnpStatusEnums.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeDnpStatusEnums.js)
- [`backend/src/database/migrations/ensurePixelEyeFollowUpHistoryTable.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeFollowUpHistoryTable.js)
- [`backend/src/database/migrations/ensurePixelEyeCallLogTable.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeCallLogTable.js)
- [`backend/src/database/migrations/ensurePixelEyeFollowUpCallComplianceTable.js`](/d:/INVICTUS%20BACKEND/Invictus/backend/src/database/migrations/ensurePixelEyeFollowUpCallComplianceTable.js)

## 5. Workflow

### A. Open the detail page

1. The router loads `pixel-eye/leads/:leadId`.
2. The page component resolves `clientKey` and `leadId`.
3. `usePixelEyeLeadQuery` fetches the lead.
4. Related history and compliance queries load in parallel.
5. The UI renders the summary, actions, and detail sections.

### B. Update the lead

1. The user changes the lead status or one of the day fields.
2. The page calls `useUpdatePixelEyeMutation`.
3. The backend updates `PixelEye`.
4. The frontend invalidates and refetches lead, history, and compliance data.

### C. Reschedule a follow-up

1. The user opens the reschedule dialog.
2. The user selects a new date and adds a reason.
3. The page calls `useReschedulePixelEyeFollowUpMutation`.
4. The backend updates the reminder state and records history.
5. The page refreshes the detail data.

### D. Legacy mark handled

Mark handled is no longer a supported user action. Old `MANUAL_HANDLED` state can still appear as read-only legacy data when returned by the backend.

1. The user opens the handled dialog.
2. The page submits the handled reason.
3. The backend marks the follow-up reminder handled.
4. The page refetches the lead and related data.

### E. Close / cancel

1. The user opens the cancel dialog.
2. The user selects a terminal status and adds notes.
3. The page calls `useCancelPixelEyeFollowUpMutation`.
4. The backend closes the active reminder flow.
5. The UI refreshes to show the new terminal state.

## 6. Design Notes

The detail page follows the shared PixelEye visual system:

- dark and light mode support
- rounded cards
- muted borders
- green primary accent for CRM actions
- action dialogs using the shared dialog styling helpers

The page intentionally keeps the lead-detail workflow focused on:

- one lead at a time
- one source of truth from the backend
- immediate refetch after mutation

## 7. File Structure At A Glance

### Frontend

- `frontend/src/pages/pixel-eye/lead-detail.tsx`
- `frontend/src/components/sections/pixel-eye-lead-detail/index.tsx`
- `frontend/src/components/hooks/usePixelEyeQuery.tsx`
- `frontend/src/components/sections/pixel-eye/pixelEyeUi.tsx`
- `frontend/src/components/sections/pixel-eye/pixelEyeThemeStyles.ts`
- `frontend/src/components/sections/pixel-eye/pixelEyeStatuses.ts`

### Backend

- `backend/src/app.js`
- `backend/src/modules/pixelEye/pixelEye.routes.js`
- `backend/src/modules/pixelEye/pixelEye.controller.js`
- `backend/src/modules/pixelEye/pixelEye.service.js`
- `backend/src/modules/pixelEye/pixelEyeNotification.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpHistory.service.js`
- `backend/src/modules/pixelEye/pixelEyeFollowUpCallCompliance.service.js`

## 8. Short Summary

The PixelEye lead detail page is a single-lead CRM workflow that sits on top of the shared PixelEye backend.

Frontend:

- loads one lead
- shows its full state
- lets the user update status and follow-up actions

Backend:

- validates tenant context
- reads and updates the lead record
- persists reminder history
- manages follow-up state and compliance rows

Workflow:

- page opens
- data loads
- user performs an action
- backend updates the lead
- UI refetches and stays in sync
