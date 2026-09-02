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
  /** Query params appended to the segment's path (used by the source items). */
  query?: Record<string, string>;
  children?: PortalNavChild[];
}

// Exact order per the approved Birthwave portal spec — do not reorder.
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { segment: 'dashboard', label: 'Dashboard', icon: 'hugeicons:grid-view' },
  // "Leads" (the bare CRM leads list) is hidden per request. The enquiry-source
  // views below cover day-to-day use; the CRM list is still at /portal/leads.
  // { segment: 'leads', label: 'Leads', icon: 'hugeicons:user-multiple' },
  ...WEBSITE_SOURCE_ORDER.map((key) => ({
    segment: 'leads',
    label: WEBSITE_SOURCE_LABELS[key],
    icon: 'hugeicons:user-multiple',
    query: { view: key },
  })),
  { segment: 'appointments', label: 'Appointments', icon: 'hugeicons:calendar-03' },
  { segment: 'calls', label: 'Calls', icon: 'hugeicons:call-02' },
  { segment: 'doctors', label: 'Doctors', icon: 'solar:stethoscope-linear' },
  { segment: 'campaign-sources', label: 'Campaign Sources', icon: 'hugeicons:megaphone-02' },
  { segment: 'follow-ups', label: 'Follow-ups', icon: 'solar:clock-circle-linear' },
  { segment: 'reports', label: 'Reports', icon: 'hugeicons:chart-bar-line-01' },
  { segment: 'settings', label: 'Settings', icon: 'hugeicons:settings-02' },
];
