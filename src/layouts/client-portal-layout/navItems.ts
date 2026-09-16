import { WEBSITE_SOURCE_LABELS, WEBSITE_SOURCE_ORDER } from 'pages/birthwave/constants';

export interface PortalNavChild {
  label: string;
  segment?: string;
  /** Query params appended to the parent segment's path. Empty = the bare page. */
  query?: Record<string, string>;
}

export interface PortalNavItem {
  segment: string;
  label: string;
  icon: string;
  /** Query params appended to the segment's path (for a plain, childless item). */
  query?: Record<string, string>;
  children?: PortalNavChild[];
  /** Visible only to tenant admins + authorized Team Managers. */
  managerOnly?: boolean;
  /** Visible only to tenant admins (Birthwave configuration surfaces). */
  adminOnly?: boolean;
}

// "Leads" links to the CRM leads list; its sub-items are the website /
// landing-page enquiry sources, plus a fixed-filter "Instagram Leads" view
// (source=instagram, source_provider=REPLI) over the SAME birthwave_leads
// list — not a separate lead source/table.
//
// BW-UI-008: "All Leads" is first and deliberate. The parent row only expands
// and collapses the group (see Sidebar), and every other child is a fixed
// source filter, so without this entry there was no way to reach the unfiltered
// Leads list from the sidebar at all — the primary Leads surface was
// unreachable by navigation.
const LEADS_CHILDREN: PortalNavChild[] = [
  { label: 'All Leads' },
  { label: WEBSITE_SOURCE_LABELS[WEBSITE_SOURCE_ORDER[0]], query: { view: WEBSITE_SOURCE_ORDER[0] } },
  { label: 'Instagram Leads', query: { view: 'instagram' } },
  ...WEBSITE_SOURCE_ORDER.slice(1).map((key) => ({
    label: WEBSITE_SOURCE_LABELS[key],
    query: { view: key },
  })),
];

// Exact order per the approved Birthwave portal spec — do not reorder.
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { segment: 'dashboard', label: 'Dashboard', icon: 'hugeicons:grid-view' },
  { segment: 'my-work', label: 'My Work', icon: 'hugeicons:task-02' },
  { segment: 'attention', label: 'Needs Attention', icon: 'hugeicons:alert-02', managerOnly: true },
  { segment: 'leads', label: 'Leads', icon: 'hugeicons:user-multiple', children: LEADS_CHILDREN },
  { segment: 'appointments', label: 'Appointments', icon: 'hugeicons:calendar-03' },
  // BW-UI-009: Calls reads crm_calls, which is the V2 telephony/Runo foundation.
  // It has no producer in V1 (nothing calls /crm/calls/ingest/:provider), so the
  // page could only ever render an empty list while implying call logging works.
  // Hidden like Doctors / Campaign Sources / Reports / Settings; route untouched.
  // { segment: 'calls', label: 'Calls', icon: 'hugeicons:call-02' },
  { segment: 'teams', label: 'Teams', icon: 'hugeicons:user-group', managerOnly: true, children: [
    { label: 'All Teams' },
    { label: 'Team Members', segment: 'team-members' },
  ] },
  { segment: 'assignment-rules', label: 'Assignment Rules', icon: 'hugeicons:workflow-square-01', adminOnly: true },
  // BW-SVC-001: the service master. Settings as a whole stays out of the nav
  // (it still holds the two reference-only integration panels), but Services is
  // a real administrative surface — it drives every lead form, landing page and
  // routing rule — so it gets its own admin-only entry straight into that tab.
  { segment: 'settings', label: 'Services', icon: 'hugeicons:layers-01', query: { tab: 'services' }, adminOnly: true },
  // Doctors, Campaign Sources, Reports, Settings — hidden per request.
  // Pages/routes are untouched; reach them directly by URL if needed.
  // { segment: 'doctors', label: 'Doctors', icon: 'solar:stethoscope-linear' },
  // { segment: 'campaign-sources', label: 'Campaign Sources', icon: 'hugeicons:megaphone-02' },
  { segment: 'follow-ups', label: 'Follow-ups', icon: 'solar:clock-circle-linear' },
  // { segment: 'reports', label: 'Reports', icon: 'hugeicons:chart-bar-line-01' },
  // { segment: 'settings', label: 'Settings', icon: 'hugeicons:settings-02' },
];
