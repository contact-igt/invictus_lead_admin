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
  /** Nullable — a valid Repli Instagram lead can have no phone collected. */
  phone: string | null;
  email: string | null;
  /**
   * BW-SVC-001: display name, resolved from the service master when the Lead is
   * linked — so a renamed service shows through immediately — and falling back to
   * the legacy free text for Leads whose value never mapped to a service.
   */
  service: string | null;
  /** Canonical service reference. Null for unmapped legacy/free-text values. */
  service_id?: number | null;
  service_ref?: BirthwaveServiceRef | null;
  source: string | null;
  status: string;
  stage?: string;
  contact_id?: number | null;
  contact?: BirthwaveContact | null;
  other_leads?: Array<{ id: number; name: string; service: string | null; source: string | null; status: string; stage?: string; created_at: string }>;
  assigned_doctor_id: number | null;
  current_team_id?: number | null;
  current_team?: { id: number; name: string; code: string } | null;
  current_owner_id?: number | null;
  current_owner?: { id: number; username: string; email: string } | null;
  assignment_status?: 'UNASSIGNED' | 'ASSIGNED';
  assignments?: BirthwaveLeadAssignment[];
  assignedDoctor?: { id: number; name: string; specialty?: string | null } | null;
  next_follow_up: string | null;
  notes: string | null;
  source_provider?: string | null;
  source_external_id?: string | null;
  /** Provider integration payload (e.g. Repli/Instagram): campaign, answers, conversation id, … */
  integration_metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  custom_fields?: CrmCustomFieldValues;
  /** Dashboard "Recent Leads" only: 'website' rows link to the source view, not a CRM detail page. */
  kind?: 'crm' | 'website';
  source_key?: string | null;
}

export interface BirthwaveContact {
  id: number;
  client_id?: number;
  display_name: string;
  normalized_phone: string | null;
  normalized_email: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface BirthwaveTeamMember {
  id: number;
  client_id: number;
  team_id: number;
  management_id: number;
  operational_role: 'TEAM_MANAGER' | 'TELECALLER' | string;
  assignment_enabled: boolean;
  status: 'ACTIVE' | 'ASSIGNMENT_PAUSED' | 'INACTIVE' | string;
  service_access: string[];
  source_access: string[];
  management: { id: number; username: string; email: string; role: string } | null;
}

export interface BirthwaveTeam {
  id: number;
  client_id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  member_count: number;
  assigned_lead_count: number;
  members?: BirthwaveTeamMember[];
  created_at?: string;
  updated_at?: string;
}

export interface BirthwaveInitialTeamMember {
  management_id: number;
  operational_role: 'TEAM_MANAGER' | 'TELECALLER' | string;
  assignment_enabled?: boolean;
  status?: 'ACTIVE' | 'ASSIGNMENT_PAUSED' | 'INACTIVE' | string;
  service_access?: string[];
  source_access?: string[];
}

export interface BirthwaveLeadAssignment {
  id: number;
  lead_id: number;
  team_id: number;
  team: { id: number; name: string; code: string } | null;
  owner_id: number;
  owner: { id: number; username: string; email: string } | null;
  assignment_type: string;
  assigned_by: number | null;
  assignedBy?: { id: number; username: string; email: string } | null;
  reason: string | null;
  is_current: boolean;
  assigned_at: string;
  ended_at: string | null;
}

export type BirthwaveTaskType = 'INITIAL_CALL' | 'RETRY_CALL' | 'FOLLOW_UP' | 'APPOINTMENT_CONFIRMATION' | 'NO_SHOW_RECOVERY' | 'MANUAL_TASK';
export type BirthwaveTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'RESCHEDULED' | 'CANCELLED';
export type BirthwaveTaskPriority = 'NORMAL' | 'HIGH';
export type BirthwaveContactResult = 'CONNECTED' | 'NOT_REACHED';
export type BirthwaveDispositionCode = 'INTERESTED' | 'FOLLOW_UP_REQUIRED' | 'CALL_LATER' | 'APPOINTMENT_REQUIRED' | 'NOT_INTERESTED' | 'WRONG_NUMBER' | 'INVALID_LEAD' | 'OTHER';

export interface BirthwaveDispositionOptions {
  evidence_sources: string[];
  contact_results: string[];
  not_reached_reasons: string[];
  dispositions: string[];
  next_action_types: string[];
  lost_reasons: string[];
}

export interface BirthwaveOutcome {
  id: number;
  outcome_event_id: string;
  client_id: number;
  lead_id: number;
  task_id: number;
  evidence_source: 'MANUAL_TASK' | string;
  contact_result: BirthwaveContactResult | string;
  not_reached_reason: string | null;
  disposition: BirthwaveDispositionCode | string | null;
  notes: string | null;
  next_action_type: string | null;
  next_action_due_at: string | null;
  appointment_id: number | null;
  lost_reason: string | null;
  created_by: number | null;
  created_at: string;
  task_type?: string | null;
}

export interface BirthwaveOutcomeInput {
  outcome_event_id: string;
  contact_result: BirthwaveContactResult;
  not_reached_reason?: string;
  disposition?: BirthwaveDispositionCode;
  notes?: string;
  next_action_type?: string;
  next_action_due_at?: string;
  lost_reason?: string;
  appointment?: { doctor_id?: number | null; scheduled_at: string; service?: string; notes?: string };
}

export interface BirthwaveTask {
  id: number;
  client_id: number;
  lead_id: number;
  team_id: number;
  team: { id: number; name: string; code: string } | null;
  owner_id: number;
  owner: { id: number; username: string; email: string; role?: string } | null;
  task_type: BirthwaveTaskType | string;
  status: BirthwaveTaskStatus | string;
  priority: BirthwaveTaskPriority | string;
  due_at: string;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  is_primary: boolean;
  is_primary_active: boolean;
  parent_task_id: number | null;
  attempt_number: number;
  completion_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  lead?: { id: number; name: string; phone: string | null; service: string | null; stage: string } | null;
  contact?: { id: number; display_name: string; normalized_phone: string | null; normalized_email: string | null } | null;
}

export interface BirthwaveWorkItem {
  task_id: number;
  task_type: BirthwaveTaskType | string;
  task_status: BirthwaveTaskStatus | string;
  priority: BirthwaveTaskPriority | string;
  due_at: string;
  is_overdue: boolean;
  lead_id: number;
  lead_stage: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  service: string | null;
  source: string | null;
  team: { id: number; name: string; code: string } | null;
  owner: { id: number; username: string; email: string } | null;
  last_note: { text: string | null; author: string | null; timestamp: string } | null;
  last_activity: { id: number; event_type: string; title: string; description: string | null; author: string | null; timestamp: string } | null;
  started_at: string | null;
  primary_next_action: boolean;
}

export interface BirthwaveWorkSection {
  tasks: BirthwaveWorkItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface BirthwaveWorkResponse {
  timezone: string;
  generated_at: string;
  sections: Record<'NOW' | 'TODAY' | 'FOLLOW_UPS' | 'RETRIES' | 'UPCOMING' | 'OVERDUE', BirthwaveWorkSection>;
  counts: { due_today: number; follow_ups: number; retries: number; overdue: number };
  summary?: {
    by_owner: Array<{
      owner: { id: number; username: string; email: string | null };
      today: number;
      completed: number;
      remaining: number;
      overdue: number;
    }>;
  };
}

export interface BirthwaveService {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

/** The trimmed service shape embedded on a Lead or an assignment rule. */
export interface BirthwaveServiceRef {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface BirthwaveAssignmentRule {
  id: number;
  name: string;
  priority: number;
  service: string | null;
  // BW-SVC-001: canonical routing criterion. `service` is the display name.
  service_id: number | null;
  service_ref: BirthwaveServiceRef | null;
  source: string | null;
  team_id: number;
  team: { id: number; name: string; code: string } | null;
  assignment_method: 'MANUAL' | 'ROUND_ROBIN' | string;
  is_active: boolean;
}

export interface BirthwaveTeamContext {
  is_admin: boolean;
  memberships: BirthwaveTeamMember[];
}

export interface BirthwaveManagementCandidate {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface BirthwaveAppointment {
  id: number;
  lead_id: number;
  doctor_id: number | null;
  service: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  lead?: { id: number; name: string; phone: string | null } | null;
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
    | 'call_logged'
    | 'lead_source_activity'
    | 'note_added'
    | 'team_selected'
    | 'assigned'
    | 'reassigned'
    | 'assignment_failed'
    | 'routing_failed'
    | 'task_created'
    | 'task_started'
    | 'task_completed'
    | 'task_rescheduled'
    | 'task_cancelled'
    | 'primary_task_changed'
    | 'missing_next_action'
    | 'contact_attempt_recorded'
    | 'customer_connected'
    | 'customer_not_reached'
    | 'disposition_recorded'
    | 'follow_up_created'
    | 'retry_created'
    | 'appointment_confirmed'
    | 'appointment_attended'
    | 'appointment_no_show'
    | 'appointment_cancelled'
    | 'lead_lost'
    | 'lead_invalid';
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
  operational?: BirthwaveOperationalDashboard;
}

export interface BirthwaveAttention {
  id: number;
  client_id: number;
  lead_id: number | null;
  task_id: number | null;
  team_id: number | null;
  owner_id: number | null;
  attention_type: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED' | string;
  severity: 'NORMAL' | 'HIGH' | string;
  title: string;
  description: string | null;
  detected_at: string;
  age_minutes: number;
  resolution_note: string | null;
  lead: { id: number; name: string; phone: string | null; service: string | null; stage: string } | null;
  task: { id: number; task_type: string; status: string; due_at: string; is_primary: boolean } | null;
  team: { id: number; name: string; code: string } | null;
  owner: { id: number; username: string; email: string } | null;
}

export interface BirthwaveOperationalDashboard {
  timezone: string;
  generated_at: string;
  range: { preset: string; start: string; end: string };
  kpis: Record<string, number>;
  lead_sources: Array<{ source: string; count: number }>;
  service_breakdown: Array<{ service: string; count: number }>;
  team_summary: Array<{ team: { id: number; name: string; code: string }; assigned_leads: number; tasks_due: number; completed_today: number; overdue: number; open_attention: number }>;
  telecaller_summary: Array<{ owner: { id: number; username: string; email: string }; tasks_today: number; completed: number; remaining: number; overdue: number; active_leads: number }>;
  appointment_summary: { scheduled_today: number; confirmed_today: number; completed_attended: number; no_show: number; cancelled: number };
  attention_summary: Array<{ attention_type: string; count: number }>;
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
  syncRepliLeads: () => _axios('post', '/integrations/repli/birthwave/sync', {}),
  getDashboard: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/dashboard', undefined, undefined, withClientKey(params, clientKey)),
  getAttention: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/attention', undefined, undefined, withClientKey(params, clientKey)),
  getAttentionItem: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/attention/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  acknowledgeAttention: (clientKey: string | undefined, id: number | string) =>
    _axios('post', `/birthwave/attention/${id}/acknowledge`, {}, undefined, withClientKey({}, clientKey)),
  resolveAttention: (clientKey: string | undefined, id: number | string, resolution_note?: string) =>
    _axios('post', `/birthwave/attention/${id}/resolve`, { resolution_note }, undefined, withClientKey({}, clientKey)),
  dismissAttention: (clientKey: string | undefined, id: number | string, resolution_note?: string) =>
    _axios('post', `/birthwave/attention/${id}/dismiss`, { resolution_note }, undefined, withClientKey({}, clientKey)),
  reconcileAttention: (clientKey: string | undefined) =>
    _axios('post', '/birthwave/attention/reconcile', {}, undefined, withClientKey({}, clientKey)),

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
  addLeadNote: (clientKey: string | undefined, id: number | string, note: string) =>
    _axios('post', `/birthwave/leads/${id}/notes`, { note }, undefined, withClientKey({}, clientKey)),
  getLeadAssignments: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/leads/${id}/assignments`, undefined, undefined, withClientKey({}, clientKey)),
  assignLead: (clientKey: string | undefined, id: number | string, data: { team_id: number; owner_id: number; reason?: string }) =>
    _axios('post', `/birthwave/leads/${id}/assign`, data, undefined, withClientKey({}, clientKey)),
  bulkAssignLeads: (clientKey: string | undefined, data: { lead_ids: number[]; team_id: number; owner_id: number; reason?: string }) =>
    _axios('post', '/birthwave/leads/bulk-assign', data, undefined, withClientKey({}, clientKey)),
  routeLead: (clientKey: string | undefined, id: number | string) =>
    _axios('post', `/birthwave/leads/${id}/route`, undefined, undefined, withClientKey({}, clientKey)),

  getTasks: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/tasks', undefined, undefined, withClientKey(params, clientKey)),
  getMyWork: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/work/my', undefined, undefined, withClientKey(params, clientKey)),
  getTeamWork: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/work/team', undefined, undefined, withClientKey(params, clientKey)),
  getTask: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/tasks/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  getDispositionOptions: (clientKey: string | undefined) =>
    _axios('get', '/birthwave/dispositions', undefined, undefined, withClientKey({}, clientKey)),
  recordTaskOutcome: (clientKey: string | undefined, id: number | string, data: BirthwaveOutcomeInput) =>
    _axios('post', `/birthwave/tasks/${id}/outcome`, data, undefined, withClientKey({}, clientKey)),
  getLeadOutcomes: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/leads/${id}/outcomes`, undefined, undefined, withClientKey({}, clientKey)),
  createTask: (clientKey: string | undefined, data: Record<string, unknown>) =>
    _axios('post', '/birthwave/tasks', data, undefined, withClientKey({}, clientKey)),
  startTask: (clientKey: string | undefined, id: number | string) =>
    _axios('post', `/birthwave/tasks/${id}/start`, {}, undefined, withClientKey({}, clientKey)),
  completeTask: (clientKey: string | undefined, id: number | string, data: { completion_reason: string; successor?: { task_type: 'MANUAL_TASK'; due_at: string; priority?: string } }) =>
    _axios('post', `/birthwave/tasks/${id}/complete`, data, undefined, withClientKey({}, clientKey)),
  rescheduleTask: (clientKey: string | undefined, id: number | string, data: { due_at: string; reason: string; priority?: string }) =>
    _axios('post', `/birthwave/tasks/${id}/reschedule`, data, undefined, withClientKey({}, clientKey)),
  cancelTask: (clientKey: string | undefined, id: number | string, data: { reason: string; successor?: { task_type: 'MANUAL_TASK'; due_at: string; priority?: string } }) =>
    _axios('post', `/birthwave/tasks/${id}/cancel`, data, undefined, withClientKey({}, clientKey)),

  getTeams: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/teams', undefined, undefined, withClientKey(params, clientKey)),
  getTeam: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/teams/${id}`, undefined, undefined, withClientKey({}, clientKey)),
  createTeam: (clientKey: string | undefined, data: Partial<BirthwaveTeam>) =>
    _axios('post', '/birthwave/teams', data, undefined, withClientKey({}, clientKey)),
  updateTeam: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveTeam>) =>
    _axios('patch', `/birthwave/teams/${id}`, data, undefined, withClientKey({}, clientKey)),
  getTeamMembers: (clientKey: string | undefined, id: number | string) =>
    _axios('get', `/birthwave/teams/${id}/members`, undefined, undefined, withClientKey({}, clientKey)),
  addTeamMember: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveTeamMember>) =>
    _axios('post', `/birthwave/teams/${id}/members`, data, undefined, withClientKey({}, clientKey)),
  updateTeamMember: (clientKey: string | undefined, teamId: number | string, memberId: number | string, data: Partial<BirthwaveTeamMember>) =>
    _axios('patch', `/birthwave/teams/${teamId}/members/${memberId}`, data, undefined, withClientKey({}, clientKey)),
  getMyTeamMemberships: (clientKey: string | undefined) =>
    _axios('get', '/birthwave/teams/me', undefined, undefined, withClientKey({}, clientKey)),
  getManagementCandidates: (clientKey: string | undefined) =>
    _axios('get', '/birthwave/teams/candidates', undefined, undefined, withClientKey({}, clientKey)),
  // BW-SVC-001: the service master. Read is available to any authenticated
  // Birthwave user (Lead forms and filters need it); writes are admin-only and
  // enforced server-side.
  getServices: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/birthwave/services', undefined, undefined, withClientKey(params, clientKey)),
  createService: (clientKey: string | undefined, data: Record<string, unknown>) =>
    _axios('post', '/birthwave/services', data, undefined, withClientKey({}, clientKey)),
  updateService: (clientKey: string | undefined, id: number | string, data: Record<string, unknown>) =>
    _axios('patch', `/birthwave/services/${id}`, data, undefined, withClientKey({}, clientKey)),
  reorderServices: (clientKey: string | undefined, order: number[]) =>
    _axios('post', '/birthwave/services/reorder', { order }, undefined, withClientKey({}, clientKey)),

  getAssignmentRules: (clientKey: string | undefined) =>
    _axios('get', '/birthwave/assignment-rules', undefined, undefined, withClientKey({}, clientKey)),
  createAssignmentRule: (clientKey: string | undefined, data: Partial<BirthwaveAssignmentRule>) =>
    _axios('post', '/birthwave/assignment-rules', data, undefined, withClientKey({}, clientKey)),
  updateAssignmentRule: (clientKey: string | undefined, id: number | string, data: Partial<BirthwaveAssignmentRule>) =>
    _axios('patch', `/birthwave/assignment-rules/${id}`, data, undefined, withClientKey({}, clientKey)),

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
