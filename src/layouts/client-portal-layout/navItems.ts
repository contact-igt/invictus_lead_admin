export interface PortalNavItem {
  segment: string;
  label: string;
  icon: string;
}

// Exact order per the approved Birthwave portal spec — do not reorder.
export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { segment: 'dashboard', label: 'Dashboard', icon: 'hugeicons:grid-view' },
  { segment: 'leads', label: 'Leads', icon: 'hugeicons:user-multiple' },
  { segment: 'appointments', label: 'Appointments', icon: 'hugeicons:calendar-03' },
  { segment: 'calls', label: 'Calls', icon: 'hugeicons:call-02' },
  { segment: 'doctors', label: 'Doctors', icon: 'solar:stethoscope-linear' },
  { segment: 'campaign-sources', label: 'Campaign Sources', icon: 'hugeicons:megaphone-02' },
  { segment: 'follow-ups', label: 'Follow-ups', icon: 'solar:clock-circle-linear' },
  { segment: 'reports', label: 'Reports', icon: 'hugeicons:chart-bar-line-01' },
  { segment: 'settings', label: 'Settings', icon: 'hugeicons:settings-02' },
];
