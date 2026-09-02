export const LEAD_STATUS_ORDER = ['new_lead', 'contacted', 'consultation_booked', 'visited', 'converted'] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  consultation_booked: 'Consultation Booked',
  visited: 'Visited',
  converted: 'Converted',
};

export const LEAD_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  new_lead: { bg: 'var(--bw-tint-blue)', fg: '#2563EB' },
  contacted: { bg: 'var(--bw-tint-amber)', fg: '#F59E0B' },
  consultation_booked: { bg: 'var(--bw-tint-green)', fg: '#16A34A' },
  visited: { bg: 'var(--bw-tint-violet)', fg: '#7C3AED' },
  converted: { bg: 'var(--bw-tint-green)', fg: '#29AF81' },
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  website: 'Website',
  whatsapp: 'WhatsApp',
  walk_in: 'Walk-in',
  referral: 'Referral',
  other: 'Other',
};

export const WEBSITE_SOURCE_LABELS: Record<string, string> = {
  birthwave_website: 'Website Inquiries',
  birthwave_normalbirth: 'Normal Birth',
  birthwave_naturalbirth: 'Natural Birth',
  birthwave_pregnancycare: 'Pregnancy Care',
  birthwave_vbac: 'VBAC',
};

export const WEBSITE_SOURCE_ORDER = [
  'birthwave_website',
  'birthwave_normalbirth',
  'birthwave_naturalbirth',
  'birthwave_pregnancycare',
  'birthwave_vbac',
] as const;

export const WEBSITE_LEAD_STATUS_LABELS: Record<string, string> = {
  New: 'New',
  Contacted: 'Contacted',
  'In Progress': 'In Progress',
  Converted: 'Converted',
  Closed: 'Closed',
};

export const WEBSITE_LEAD_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  New: { bg: 'var(--bw-tint-blue)', fg: '#2563EB' },
  Contacted: { bg: 'var(--bw-tint-amber)', fg: '#F59E0B' },
  'In Progress': { bg: 'var(--bw-tint-violet)', fg: '#7C3AED' },
  Converted: { bg: 'var(--bw-tint-green)', fg: '#29AF81' },
  Closed: { bg: 'var(--bw-surface-2)', fg: 'var(--bw-text-muted)' },
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled: 'Cancelled',
};

export const APPOINTMENT_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: 'var(--bw-tint-blue)', fg: '#2563EB' },
  confirmed: { bg: 'var(--bw-tint-green)', fg: '#16A34A' },
  completed: { bg: 'var(--bw-tint-green)', fg: '#29AF81' },
  no_show: { bg: 'var(--bw-tint-red)', fg: '#EF4444' },
  cancelled: { bg: 'var(--bw-surface-2)', fg: 'var(--bw-text-muted)' },
};
