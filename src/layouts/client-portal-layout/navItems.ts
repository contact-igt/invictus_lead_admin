import { WEBSITE_SOURCE_LABELS, WEBSITE_SOURCE_ORDER } from 'pages/birthwave/constants';

export interface PortalNavChild {
  label: string;
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
}

// "Leads" links to the CRM leads list; its sub-items are the website /
// landing-page enquiry sources, plus a fixed-filter "Instagram Leads" view
// (source=instagram, source_provider=REPLI) over the SAME birthwave_leads
// list — not a separate lead source/table.
const LEADS_CHILDREN: PortalNavChild[] = [
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
  { segment: 'leads', label: 'Leads', icon: 'hugeicons:user-multiple', children: LEADS_CHILDREN },
  { segment: 'appointments', label: 'Appointments', icon: 'hugeicons:calendar-03' },
  { segment: 'calls', label: 'Calls', icon: 'hugeicons:call-02' },
  // Doctors, Campaign Sources, Reports, Settings — hidden per request.
  // Pages/routes are untouched; reach them directly by URL if needed.
  // { segment: 'doctors', label: 'Doctors', icon: 'solar:stethoscope-linear' },
  // { segment: 'campaign-sources', label: 'Campaign Sources', icon: 'hugeicons:megaphone-02' },
  { segment: 'follow-ups', label: 'Follow-ups', icon: 'solar:clock-circle-linear' },
  // { segment: 'reports', label: 'Reports', icon: 'hugeicons:chart-bar-line-01' },
  // { segment: 'settings', label: 'Settings', icon: 'hugeicons:settings-02' },
];
