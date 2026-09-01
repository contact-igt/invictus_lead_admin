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
};
