export const LEAD_STATUS_ORDER = ['new_lead', 'contacted', 'consultation_booked', 'visited', 'converted'] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  consultation_booked: 'Consultation Booked',
  visited: 'Visited',
  converted: 'Converted',
};

export const LEAD_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  new_lead: { bg: '#EFF6FF', fg: '#2563EB' },
  contacted: { bg: '#FFFBEB', fg: '#F59E0B' },
  consultation_booked: { bg: '#F0FDF4', fg: '#16A34A' },
  visited: { bg: '#F5F3FF', fg: '#7C3AED' },
  converted: { bg: '#F0FDF4', fg: '#29AF81' },
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

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled: 'Cancelled',
};

export const APPOINTMENT_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: '#EFF6FF', fg: '#2563EB' },
  confirmed: { bg: '#F0FDF4', fg: '#16A34A' },
  completed: { bg: '#F0FDF4', fg: '#29AF81' },
  no_show: { bg: '#FEF2F2', fg: '#EF4444' },
  cancelled: { bg: '#F1F5F9', fg: '#64748B' },
};
