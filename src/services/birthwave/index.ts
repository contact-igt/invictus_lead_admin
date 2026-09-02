import { _axios } from 'helper/axios';
import { CrmCustomFieldValues } from 'services/crm';

const withClientKey = (params: Record<string, unknown> = {}, clientKey?: string) =>
  clientKey ? { ...params, _client_key: clientKey } : params;

export interface BirthwaveDoctor {
  id: number;
  name: string;
  specialty: string | null;
  avatar_url: string | null;
  active: boolean;
}

export interface BirthwaveLead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  source: string | null;
  status: string;
  assigned_doctor_id: number | null;
  assignedDoctor?: { id: number; name: string; specialty?: string | null } | null;
  next_follow_up: string | null;
  notes: string | null;
  source_provider?: string | null;
  source_external_id?: string | null;
  created_at: string;
  updated_at: string;
  custom_fields?: CrmCustomFieldValues;
  /** Dashboard "Recent Leads" only: 'website' rows link to the source view, not a CRM detail page. */
  kind?: 'crm' | 'website';
  source_key?: string | null;
}

export interface BirthwaveAppointment {
  id: number;
  lead_id: number;
  doctor_id: number | null;
  service: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  lead?: { id: number; name: string; phone: string } | null;
  doctor?: { id: number; name: string } | null;
}

export interface BirthwaveLeadActivity {
  id: number;
  lead_id: number;
  actor_user_id: number | null;
  actor_name: string | null;
  event_type:
    | 'lead_created'
    | 'status_changed'
    | 'assignment_changed'
    | 'follow_up_scheduled'
    | 'appointment_created'
    | 'custom_field_changed'
    | 'call_logged';
  title: string;
  description: string | null;
  previous_value: string | null;
  new_value: string | null;
  occurred_at: string;
}

export interface BirthwaveDashboard {
  range: { start: string | null; end: string | null };
  kpis: {
    total_leads: number;
    new_leads_today: number;
    appointments_booked: number;
    confirmed_visits: number;
    no_shows: number;
    conversion_rate: number;
  };
  leads_over_time: Array<{ date: string; count: number }>;
  lead_sources: Array<{ source: string; count: number; percentage: number }>;
  doctor_wise_appointments: Array<{ doctorId: number; name: string; specialty: string | null; appointmentCount: number }>;
  pipeline: Array<{ status: string; count: number }>;
  recent_leads: BirthwaveLead[];
  follow_up_reminders: BirthwaveLead[];
  today_schedule: BirthwaveAppointment[];
}

export type BirthwaveWebsiteSourceKey =
  | 'birthwave_website'
  | 'birthwave_normalbirth'
  | 'birthwave_naturalbirth'
  | 'birthwave_pregnancycare'
  | 'birthwave_vbac';

export interface BirthwaveWebsiteLead {
  id: number;
  source_key: BirthwaveWebsiteSourceKey;
  external_lead_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  message: string | null;
  consent: boolean;
  source: string | null;
  campaign: string | null;
  creative: string | null;
  channel: string | null;
  landing_page: string | null;
  referrer: string | null;
  ip_address: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  status: string;
  notes: string | null;
  birthwave_lead_id: number | null;
  sheet_sync_status: 'pending' | 'synced' | 'failed';
  sheet_sync_attempts: number;
  sheet_sync_last_error: string | null;
  sheet_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BirthwaveWebsiteSourceCount {
  source_key: BirthwaveWebsiteSourceKey;
  total: number;
  new: number;
}

export const BirthwaveApis = {
  getDashboard: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/dashboard', undefined, undefined, withClientKey(params, clientKey)),

  getLeads: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/leads', undefined, undefined, withClientKey(params, clientKey)),
  getLead: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/leads/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  getLeadTimeline: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/leads/${id}/timeline`, undefined, undefined, withClientKey({}, clientKey)),
  createLead: (clientKey: string | undefined, data: Partial<BirthwaveLead>) =>
    _axios('post', '/birthwave/leads', data, undefined, withClientKey({}, clientKey)),
  updateLead: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveLead>) =>
    _axios('patch', `/birthwave/leads/${id}`, data, undefined, withClientKey({}, clientKey)),

  getDoctors: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/doctors', undefined, undefined, withClientKey(params, clientKey)),
  createDoctor: (clientKey: string | undefined, data: Partial<BirthwaveDoctor>) =>
    _axios('post', '/birthwave/doctors', data, undefined, withClientKey({}, clientKey)),
  updateDoctor: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveDoctor>) =>
    _axios('patch', `/birthwave/doctors/${id}`, data, undefined, withClientKey({}, clientKey)),

  getAppointments: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/appointments', undefined, undefined, withClientKey(params, clientKey)),
  createAppointment: (clientKey: string | undefined, data: Partial<BirthwaveAppointment>) =>
    _axios('post', '/birthwave/appointments', data, undefined, withClientKey({}, clientKey)),
  updateAppointment: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveAppointment>) =>
    _axios('patch', `/birthwave/appointments/${id}`, data, undefined, withClientKey({}, clientKey)),

  // Website / landing-page enquiries
  getWebsiteLeads: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/website-leads', undefined, undefined, withClientKey(params, clientKey)),
  getWebsiteLeadSources: (clientKey: string | undefined) =>
    _axios('get', '/birthwave/website-leads/sources', undefined, undefined, withClientKey({}, clientKey)),
  getWebsiteLead: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/website-leads/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  updateWebsiteLead: (
    clientKey: string | undefined,
    id: number | string,
    data: { status?: string; notes?: string | null },
  ) => _axios('patch', `/birthwave/website-leads/${id}`, data, undefined, withClientKey({}, clientKey)),
  deleteWebsiteLead: (clientKey: string | undefined, id: number | string) =>
    _axios('delete', `/birthwave/website-leads/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  retryWebsiteLeadSheetSync: (clientKey: string | undefined, id: number | string) =>
    _axios('post', `/birthwave/website-leads/${id}/retry-sheet-sync`, undefined, undefined, withClientKey({}, clientKey)),
  retryFailedWebsiteLeadSheetSyncs: (clientKey: string | undefined, sourceKey?: string) =>
    _axios(
      'post',
      '/birthwave/website-leads/retry-failed-sheet-sync',
      undefined,
      undefined,
      withClientKey(sourceKey ? { source_key: sourceKey } : {}, clientKey),
    ),
  promoteWebsiteLead: (clientKey: string | undefined, id: number | string) =>
    _axios('post', `/birthwave/website-leads/${id}/promote`, undefined, undefined, withClientKey({}, clientKey)),
};
