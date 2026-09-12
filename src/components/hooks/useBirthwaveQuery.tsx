import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import {
  BirthwaveApis,
  BirthwaveAppointment,
  BirthwaveDashboard,
  BirthwaveDoctor,
  BirthwaveLead,
  BirthwaveLeadActivity,
  BirthwaveLeadAssignment,
  BirthwaveTeam,
  BirthwaveInitialTeamMember,
  BirthwaveTeamContext,
  BirthwaveTeamMember,
  BirthwaveAssignmentRule,
  BirthwaveManagementCandidate,
  BirthwaveService,
  BirthwaveTask,
  BirthwaveWebsiteLead,
  BirthwaveWebsiteSourceCount,
  BirthwaveWorkResponse,
  BirthwaveDispositionOptions,
  BirthwaveOutcome,
  BirthwaveOutcomeInput,
  BirthwaveAttention,
} from 'services/birthwave';

interface ErrorPayload {
  message?: string;
}

export const useSyncRepliLeadsMutation = () => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(BirthwaveApis.syncRepliLeads, {
    onSuccess: (result) => {
      enqueueSnackbar(`Fetched ${result.fetched}: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.failed} failed.`, {
        variant: result.failed || result.skipped ? 'warning' : 'success',
      });
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-lead-detail']);
      qc.invalidateQueries(['birthwave-dashboard']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Unable to sync Repli leads'), { variant: 'error' });
    },
  });
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as AxiosError<ErrorPayload>)?.response?.data?.message || fallback;

// ── Dashboard ────────────────────────────────────────────────────────────
export const useBirthwaveDashboardQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveDashboard>(
    ['birthwave-dashboard', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getDashboard(clientKey, params);
      return res.data as BirthwaveDashboard;
    },
    { enabled: options.enabled ?? true },
  );

// ── Leads ────────────────────────────────────────────────────────────────
export const useBirthwaveLeadsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<{ data: BirthwaveLead[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-leads', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getLeads(clientKey, params);
      return res as { data: BirthwaveLead[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
    {
      enabled: options.enabled ?? true,
      keepPreviousData: true,
      // Externally-ingested leads (e.g. Repli/Instagram) land without a client
      // action; a light poll surfaces them on an open Lead Admin tab. No
      // Socket.IO exists for leads yet — this is the phase-one approach.
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    },
  );

export const useBirthwaveLeadDetailQuery = (
  clientKey: string | undefined,
  leadId: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveLead>(
    ['birthwave-lead-detail', clientKey, leadId],
    async () => {
      const res = await BirthwaveApis.getLead(clientKey, leadId as string);
      return res.data as BirthwaveLead;
    },
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useBirthwaveLeadTimelineQuery = (
  clientKey: string | undefined,
  leadId: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveLeadActivity[]>(
    ['birthwave-lead-timeline', clientKey, leadId],
    async () => {
      const res = await BirthwaveApis.getLeadTimeline(clientKey, leadId as string);
      return (res?.data ?? []) as BirthwaveLeadActivity[];
    },
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useCreateBirthwaveLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveLead>) => BirthwaveApis.createLead(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Lead added successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-dashboard']);
      // BW-UI-006: creating a Lead routes it, assigns it and creates its
      // INITIAL_CALL Primary Task — or raises an UNASSIGNED_LEAD exception when
      // no rule matches. All three surfaces must refresh.
      qc.invalidateQueries(['birthwave-tasks']);
      qc.invalidateQueries(['birthwave-work-my']);
      qc.invalidateQueries(['birthwave-work-team']);
      qc.invalidateQueries(['birthwave-attention']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to add lead'), { variant: 'error' });
    },
  });
};

export const useUpdateBirthwaveLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveLead> }) =>
      BirthwaveApis.updateLead(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Lead updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-leads']);
        qc.invalidateQueries(['birthwave-dashboard']);
        // BW-UI-006: the Edit action lives on Lead Detail, so the detail and its
        // timeline must refresh too — without these the drawer saves and the page
        // behind it keeps showing the old values until a manual browser refresh.
        qc.invalidateQueries(['birthwave-lead-detail']);
        qc.invalidateQueries(['birthwave-lead-timeline']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update lead'), { variant: 'error' });

      },
    },
  );
};

export const useAddBirthwaveLeadNoteMutation = (clientKey: string | undefined, leadId?: number | string) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((note: string) => BirthwaveApis.addLeadNote(clientKey, leadId as string, note), {
    onSuccess: () => {
      enqueueSnackbar('Note added', { variant: 'success' });
      qc.invalidateQueries(['birthwave-lead-timeline', clientKey, leadId]);
      qc.invalidateQueries(['birthwave-lead-detail', clientKey, leadId]);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to add note'), { variant: 'error' });
    },
  });
};

export const useBirthwaveLeadAssignmentsQuery = (clientKey: string | undefined, leadId: number | string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveLeadAssignment[]>(
    ['birthwave-lead-assignments', clientKey, leadId],
    async () => (await BirthwaveApis.getLeadAssignments(clientKey, leadId as string)).data as BirthwaveLeadAssignment[],
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useBirthwaveAttentionQuery = (clientKey: string | undefined, params: Record<string, unknown> = {}, options: { enabled?: boolean } = {}) =>
  useQuery<{ data: BirthwaveAttention[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-attention', clientKey, params],
    async () => (await BirthwaveApis.getAttention(clientKey, params)) as { data: BirthwaveAttention[]; pagination: { total: number; page: number; limit: number; totalPages: number } },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

const useAttentionMutation = (message: string) => {
  const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
  return { onSuccess: () => { enqueueSnackbar(message, { variant: 'success' }); qc.invalidateQueries(['birthwave-attention']); qc.invalidateQueries(['birthwave-dashboard']); }, onError: (error: unknown) => { enqueueSnackbar(errorMessage(error, 'Needs Attention operation failed'), { variant: 'error' }); } };
};
export const useAcknowledgeBirthwaveAttentionMutation = (clientKey: string | undefined) => useMutation((id: number | string) => BirthwaveApis.acknowledgeAttention(clientKey, id), useAttentionMutation('Attention acknowledged'));
export const useResolveBirthwaveAttentionMutation = (clientKey: string | undefined) => useMutation(({ id, resolution_note }: { id: number | string; resolution_note?: string }) => BirthwaveApis.resolveAttention(clientKey, id, resolution_note), useAttentionMutation('Attention resolved'));
export const useDismissBirthwaveAttentionMutation = (clientKey: string | undefined) => useMutation(({ id, resolution_note }: { id: number | string; resolution_note?: string }) => BirthwaveApis.dismissAttention(clientKey, id, resolution_note), useAttentionMutation('Attention dismissed'));
export const useReconcileBirthwaveAttentionMutation = (clientKey: string | undefined) => useMutation(() => BirthwaveApis.reconcileAttention(clientKey), useAttentionMutation('Needs Attention reconciled'));

export const useBirthwaveLeadOutcomesQuery = (clientKey: string | undefined, leadId: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveOutcome[]>(
    ['birthwave-lead-outcomes', clientKey, leadId],
    async () => (await BirthwaveApis.getLeadOutcomes(clientKey, leadId as string)).data as BirthwaveOutcome[],
    { enabled: (options.enabled ?? true) && Boolean(leadId) },
  );

export const useBirthwaveDispositionOptionsQuery = (clientKey: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveDispositionOptions>(
    ['birthwave-disposition-options', clientKey],
    async () => (await BirthwaveApis.getDispositionOptions(clientKey)).data as BirthwaveDispositionOptions,
    { enabled: options.enabled ?? true, staleTime: 5 * 60 * 1000 },
  );

export const useBirthwaveTasksQuery = (clientKey: string | undefined, params: Record<string, unknown> = {}, options: { enabled?: boolean } = {}) =>
  useQuery<{ data: BirthwaveTask[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-tasks', clientKey, params],
    async () => (await BirthwaveApis.getTasks(clientKey, params)) as { data: BirthwaveTask[]; pagination: { total: number; page: number; limit: number; totalPages: number } },
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveMyWorkQuery = (clientKey: string | undefined, params: Record<string, unknown> = {}, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveWorkResponse>(
    ['birthwave-work-my', clientKey, params],
    async () => (await BirthwaveApis.getMyWork(clientKey, params)).data as BirthwaveWorkResponse,
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveTeamWorkQuery = (clientKey: string | undefined, params: Record<string, unknown> = {}, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveWorkResponse>(
    ['birthwave-work-team', clientKey, params],
    async () => (await BirthwaveApis.getTeamWork(clientKey, params)).data as BirthwaveWorkResponse,
    { enabled: options.enabled ?? true },
  );

const useBirthwaveTaskMutationFeedback = (clientKey: string | undefined, leadId: number | string | undefined, message: string) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return {
    onSuccess: () => {
      enqueueSnackbar(message, { variant: 'success' });
      qc.invalidateQueries(['birthwave-tasks', clientKey]);
      qc.invalidateQueries(['birthwave-work-my', clientKey]);
      qc.invalidateQueries(['birthwave-work-team', clientKey]);
      qc.invalidateQueries(['birthwave-lead-detail', clientKey, leadId]);
      qc.invalidateQueries(['birthwave-lead-timeline', clientKey, leadId]);
      qc.invalidateQueries(['birthwave-lead-outcomes', clientKey, leadId]);
      qc.invalidateQueries(['birthwave-appointments', clientKey]);
      qc.invalidateQueries(['birthwave-leads', clientKey]);
    },
    onError: (error: unknown) => { enqueueSnackbar(errorMessage(error, 'Task operation failed'), { variant: 'error' }); },
  };
};

export const useBirthwaveTaskOutcomeMutation = (clientKey: string | undefined, leadId?: number | string) => {
  const feedback = useBirthwaveTaskMutationFeedback(clientKey, leadId, 'Outcome recorded');
  return useMutation(({ taskId, data }: { taskId: number | string; data: BirthwaveOutcomeInput }) => BirthwaveApis.recordTaskOutcome(clientKey, taskId, data), feedback);
};

export const useStartBirthwaveTaskMutation = (clientKey: string | undefined, leadId?: number | string) =>
  useMutation((taskId: number | string) => BirthwaveApis.startTask(clientKey, taskId), useBirthwaveTaskMutationFeedback(clientKey, leadId, 'Task started'));

export const useCompleteBirthwaveTaskMutation = (clientKey: string | undefined, leadId?: number | string) =>
  useMutation(({ taskId, data }: { taskId: number | string; data: { completion_reason: string; successor?: { task_type: 'MANUAL_TASK'; due_at: string; priority?: string } } }) => BirthwaveApis.completeTask(clientKey, taskId, data), useBirthwaveTaskMutationFeedback(clientKey, leadId, 'Task completed'));

export const useRescheduleBirthwaveTaskMutation = (clientKey: string | undefined, leadId?: number | string) =>
  useMutation(({ taskId, data }: { taskId: number | string; data: { due_at: string; reason: string; priority?: string } }) => BirthwaveApis.rescheduleTask(clientKey, taskId, data), useBirthwaveTaskMutationFeedback(clientKey, leadId, 'Task rescheduled'));

export const useCancelBirthwaveTaskMutation = (clientKey: string | undefined, leadId?: number | string) =>
  useMutation(({ taskId, data }: { taskId: number | string; data: { reason: string; successor?: { task_type: 'MANUAL_TASK'; due_at: string; priority?: string } } }) => BirthwaveApis.cancelTask(clientKey, taskId, data), useBirthwaveTaskMutationFeedback(clientKey, leadId, 'Task cancelled'));

export const useBirthwaveTeamContextQuery = (clientKey: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveTeamContext>(
    ['birthwave-team-context', clientKey],
    async () => (await BirthwaveApis.getMyTeamMemberships(clientKey)).data as BirthwaveTeamContext,
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveManagementCandidatesQuery = (clientKey: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveManagementCandidate[]>(
    ['birthwave-management-candidates', clientKey],
    async () => (await BirthwaveApis.getManagementCandidates(clientKey)).data as BirthwaveManagementCandidate[],
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveTeamsQuery = (clientKey: string | undefined, params: Record<string, unknown> = {}, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveTeam[]>(
    ['birthwave-teams', clientKey, params],
    async () => (await BirthwaveApis.getTeams(clientKey, params)).data as BirthwaveTeam[],
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveTeamQuery = (clientKey: string | undefined, teamId: number | string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveTeam>(
    ['birthwave-team', clientKey, teamId],
    async () => (await BirthwaveApis.getTeam(clientKey, teamId as string)).data as BirthwaveTeam,
    { enabled: (options.enabled ?? true) && Boolean(teamId) },
  );

export const useBirthwaveTeamMembersQuery = (clientKey: string | undefined, teamId: number | string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveTeamMember[]>(
    ['birthwave-team-members', clientKey, teamId],
    async () => (await BirthwaveApis.getTeamMembers(clientKey, teamId as string)).data as BirthwaveTeamMember[],
    { enabled: (options.enabled ?? true) && Boolean(teamId) },
  );

export const useBirthwaveAllTeamMembersQuery = (clientKey: string | undefined, teams: BirthwaveTeam[] = [], options: { enabled?: boolean } = {}) => {
  const results = useQueries(
    teams.map((team) => ({
      queryKey: ['birthwave-team-members', clientKey, team.id],
      queryFn: async () => (await BirthwaveApis.getTeamMembers(clientKey, team.id)).data as BirthwaveTeamMember[],
      enabled: (options.enabled ?? true) && Boolean(team.id),
    })),
  );
  return {
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    members: results.flatMap((result, index) => (result.data || []).map((member) => ({ ...member, team: { id: teams[index].id, name: teams[index].name, code: teams[index].code } }))),
  };
};

export const useBirthwaveAssignmentRulesQuery = (clientKey: string | undefined, options: { enabled?: boolean } = {}) =>
  useQuery<BirthwaveAssignmentRule[]>(
    ['birthwave-assignment-rules', clientKey],
    async () => (await BirthwaveApis.getAssignmentRules(clientKey)).data as BirthwaveAssignmentRule[],
    { enabled: options.enabled ?? true },
  );

const useBirthwaveMutationFeedback = (clientKey: string | undefined, message: string, invalidate: string[]) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return { qc, enqueueSnackbar, onSuccess: () => { enqueueSnackbar(message, { variant: 'success' }); invalidate.forEach((key) => qc.invalidateQueries([key, clientKey])); }, onError: (error: unknown) => { enqueueSnackbar(errorMessage(error, 'Birthwave operation failed'), { variant: 'error' }); } };
};

// ── BW-SVC-001: the Birthwave service master ────────────────────────────────
// Every service dropdown in the portal reads from here, so an admin change
// (add / rename / activate / deactivate / reorder) must invalidate both the
// service list and every surface that displays a service name: Leads, Lead
// Detail, assignment rules and the dashboard. That is what makes a change
// visible without a browser hard-refresh.
const SERVICE_DEPENDENT_KEYS = [
  'birthwave-services',
  'birthwave-leads',
  'birthwave-lead-detail',
  'birthwave-assignment-rules',
  'birthwave-dashboard',
];

export const useBirthwaveServicesQuery = (
  clientKey: string | undefined,
  params: { active?: boolean; search?: string } = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveService[]>(
    ['birthwave-services', clientKey, params],
    async () => (await BirthwaveApis.getServices(clientKey, params)).data as BirthwaveService[],
    { enabled: options.enabled ?? true, staleTime: 60_000 },
  );

export const useCreateBirthwaveServiceMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Service added', SERVICE_DEPENDENT_KEYS);
  return useMutation((data: Partial<BirthwaveService>) => BirthwaveApis.createService(clientKey, data), feedback);
};

export const useUpdateBirthwaveServiceMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Service updated', SERVICE_DEPENDENT_KEYS);
  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveService> }) => BirthwaveApis.updateService(clientKey, id, data),
    feedback,
  );
};

export const useReorderBirthwaveServicesMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Services reordered', SERVICE_DEPENDENT_KEYS);
  return useMutation((order: number[]) => BirthwaveApis.reorderServices(clientKey, order), feedback);
};

export const useCreateBirthwaveTeamMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Team created', ['birthwave-teams']);
  return useMutation((data: Partial<BirthwaveTeam> & { initial_members?: BirthwaveInitialTeamMember[] }) => BirthwaveApis.createTeam(clientKey, data), feedback);
};
export const useUpdateBirthwaveTeamMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Team updated', ['birthwave-teams', 'birthwave-team']);
  return useMutation(({ id, data }: { id: number | string; data: Partial<BirthwaveTeam> }) => BirthwaveApis.updateTeam(clientKey, id, data), feedback);
};
export const useAddBirthwaveTeamMemberMutation = (clientKey: string | undefined, teamId: number | string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Member added', ['birthwave-teams', 'birthwave-team', 'birthwave-team-members', 'birthwave-work-team', 'birthwave-leads']);
  return useMutation((data: Partial<BirthwaveTeamMember>) => BirthwaveApis.addTeamMember(clientKey, teamId as string, data), feedback);
};
export const useUpdateBirthwaveTeamMemberMutation = (clientKey: string | undefined, teamId: number | string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Member updated', ['birthwave-teams', 'birthwave-team', 'birthwave-team-members', 'birthwave-work-team', 'birthwave-leads']);
  return useMutation(({ memberId, data }: { memberId: number | string; data: Partial<BirthwaveTeamMember> }) => BirthwaveApis.updateTeamMember(clientKey, teamId as string, memberId, data), feedback);
};
// BW-UI-005: assigning a Lead also creates its INITIAL_CALL Primary Task and can
// clear an UNASSIGNED_LEAD / MISSING_OWNER exception, so the task, work-queue and
// attention caches must be invalidated too — otherwise Lead Detail's Next Action
// panel still reads "No primary next action" straight after a successful assign.
export const useAssignBirthwaveLeadMutation = (clientKey: string | undefined, leadId?: number | string) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Lead assigned', [
    'birthwave-leads',
    'birthwave-lead-detail',
    'birthwave-lead-assignments',
    'birthwave-lead-timeline',
    'birthwave-tasks',
    'birthwave-work-my',
    'birthwave-work-team',
    'birthwave-attention',
  ]);
  return useMutation((data: { team_id: number; owner_id: number; reason?: string }) => BirthwaveApis.assignLead(clientKey, leadId as string, data), feedback);
};
export const useBulkAssignBirthwaveLeadsMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(
    (data: { lead_ids: number[]; team_id: number; owner_id: number; reason?: string }) =>
      BirthwaveApis.bulkAssignLeads(clientKey, data),
    {
      onSuccess: (res: unknown) => {
        const r = res as { success_count?: number; failed_count?: number };
        const assigned = r?.success_count ?? 0;
        const failed = r?.failed_count ?? 0;
        enqueueSnackbar(
          `Bulk assigned ${assigned} lead${assigned === 1 ? '' : 's'}` + (failed ? ` · ${failed} failed` : ''),
          { variant: failed ? 'warning' : 'success' },
        );
        qc.invalidateQueries(['birthwave-leads']);
        qc.invalidateQueries(['birthwave-lead-detail']);
        qc.invalidateQueries(['birthwave-lead-assignments']);
        qc.invalidateQueries(['birthwave-dashboard']);
        qc.invalidateQueries(['birthwave-attention']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to bulk assign leads'), { variant: 'error' });
      },
    },
  );
};
export const useCreateBirthwaveAssignmentRuleMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Assignment rule created', ['birthwave-assignment-rules']);
  return useMutation((data: Partial<BirthwaveAssignmentRule>) => BirthwaveApis.createAssignmentRule(clientKey, data), feedback);
};
export const useUpdateBirthwaveAssignmentRuleMutation = (clientKey: string | undefined) => {
  const feedback = useBirthwaveMutationFeedback(clientKey, 'Assignment rule updated', ['birthwave-assignment-rules']);
  return useMutation(({ id, data }: { id: number | string; data: Partial<BirthwaveAssignmentRule> }) => BirthwaveApis.updateAssignmentRule(clientKey, id, data), feedback);
};

// ── Doctors ──────────────────────────────────────────────────────────────
export const useBirthwaveDoctorsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveDoctor[]>(
    ['birthwave-doctors', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getDoctors(clientKey, params);
      return (res?.data ?? []) as BirthwaveDoctor[];
    },
    { enabled: options.enabled ?? true },
  );

export const useCreateBirthwaveDoctorMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveDoctor>) => BirthwaveApis.createDoctor(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Doctor added successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-doctors']);
    },
    onError: (error) => {

      enqueueSnackbar(errorMessage(error, 'Failed to add doctor'), { variant: 'error' });

    },
  });
};

export const useUpdateBirthwaveDoctorMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveDoctor> }) =>
      BirthwaveApis.updateDoctor(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Doctor updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-doctors']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update doctor'), { variant: 'error' });

      },
    },
  );
};

// ── Appointments ─────────────────────────────────────────────────────────
export const useBirthwaveAppointmentsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<{ data: BirthwaveAppointment[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
    ['birthwave-appointments', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getAppointments(clientKey, params);
      return res as { data: BirthwaveAppointment[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useCreateBirthwaveAppointmentMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((data: Partial<BirthwaveAppointment>) => BirthwaveApis.createAppointment(clientKey, data), {
    onSuccess: () => {
      enqueueSnackbar('Appointment created successfully', { variant: 'success' });
      qc.invalidateQueries(['birthwave-appointments']);
      qc.invalidateQueries(['birthwave-dashboard']);
      // BW-UI-007: booking moves the Lead to APPOINTMENT_SCHEDULED and creates an
      // APPOINTMENT_CONFIRMATION Primary Task (birthwaveAppointmentContinuation),
      // so the Lead, its detail, its tasks and both work queues are all stale.
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-lead-detail']);
      qc.invalidateQueries(['birthwave-lead-timeline']);
      qc.invalidateQueries(['birthwave-tasks']);
      qc.invalidateQueries(['birthwave-work-my']);
      qc.invalidateQueries(['birthwave-work-team']);
    },
    onError: (error) => {

      enqueueSnackbar(errorMessage(error, 'Failed to create appointment'), { variant: 'error' });

    },
  });
};

export const useUpdateBirthwaveAppointmentMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: Partial<BirthwaveAppointment> }) =>
      BirthwaveApis.updateAppointment(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Appointment updated successfully', { variant: 'success' });
        qc.invalidateQueries(['birthwave-appointments']);
        qc.invalidateQueries(['birthwave-dashboard']);
        // BW-UI-007: a status change drives the whole continuation — completed
        // moves the Lead to ATTENDED, no_show opens a NO_SHOW_RECOVERY task,
        // cancelled closes the current Primary Task. Refresh everything it touches.
        qc.invalidateQueries(['birthwave-leads']);
        qc.invalidateQueries(['birthwave-lead-detail']);
        qc.invalidateQueries(['birthwave-lead-timeline']);
        qc.invalidateQueries(['birthwave-tasks']);
        qc.invalidateQueries(['birthwave-work-my']);
        qc.invalidateQueries(['birthwave-work-team']);
        qc.invalidateQueries(['birthwave-attention']);
      },
      onError: (error) => {

        enqueueSnackbar(errorMessage(error, 'Failed to update appointment'), { variant: 'error' });

      },
    },
  );
};

// ── Website / landing-page enquiries ─────────────────────────────────────
interface WebsiteLeadPage {
  data: BirthwaveWebsiteLead[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const useBirthwaveWebsiteLeadsQuery = (
  clientKey: string | undefined,
  params: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) =>
  useQuery<WebsiteLeadPage>(
    ['birthwave-website-leads', clientKey, params],
    async () => {
      const res = await BirthwaveApis.getWebsiteLeads(clientKey, params);
      return res as WebsiteLeadPage;
    },
    { enabled: options.enabled ?? true, keepPreviousData: true },
  );

export const useBirthwaveWebsiteLeadSourcesQuery = (
  clientKey: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveWebsiteSourceCount[]>(
    ['birthwave-website-lead-sources', clientKey],
    async () => {
      const res = await BirthwaveApis.getWebsiteLeadSources(clientKey);
      return (res?.data ?? []) as BirthwaveWebsiteSourceCount[];
    },
    { enabled: options.enabled ?? true },
  );

export const useBirthwaveWebsiteLeadQuery = (
  clientKey: string | undefined,
  id: number | string | null,
  options: { enabled?: boolean } = {},
) =>
  useQuery<BirthwaveWebsiteLead>(
    ['birthwave-website-lead', clientKey, id],
    async () => {
      const res = await BirthwaveApis.getWebsiteLead(clientKey, id as number);
      return res.data as BirthwaveWebsiteLead;
    },
    { enabled: (options.enabled ?? true) && Boolean(id) },
  );

export const useUpdateBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, data }: { id: number | string; data: { status?: string; notes?: string | null } }) =>
      BirthwaveApis.updateWebsiteLead(clientKey, id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Enquiry updated', { variant: 'success' });
        qc.invalidateQueries(['birthwave-website-leads']);
        qc.invalidateQueries(['birthwave-website-lead']);
        qc.invalidateQueries(['birthwave-website-lead-sources']);
      },
      onError: (error) => {
        enqueueSnackbar(errorMessage(error, 'Failed to update enquiry'), { variant: 'error' });
      },
    },
  );
};

export const useDeleteBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.deleteWebsiteLead(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Enquiry deleted', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead-sources']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to delete enquiry'), { variant: 'error' });
    },
  });
};

export const usePromoteBirthwaveWebsiteLeadMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.promoteWebsiteLead(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Enquiry promoted to a CRM lead', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
      qc.invalidateQueries(['birthwave-leads']);
      qc.invalidateQueries(['birthwave-dashboard']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to promote enquiry'), { variant: 'error' });
    },
  });
};

export const useRetryBirthwaveWebsiteLeadSheetSyncMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((id: number | string) => BirthwaveApis.retryWebsiteLeadSheetSync(clientKey, id), {
    onSuccess: () => {
      enqueueSnackbar('Google Sheet sync retried', { variant: 'success' });
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to retry sheet sync'), { variant: 'error' });
    },
  });
};

export const useRetryFailedBirthwaveWebsiteLeadSheetSyncsMutation = (clientKey: string | undefined) => {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation((sourceKey?: string) => BirthwaveApis.retryFailedWebsiteLeadSheetSyncs(clientKey, sourceKey), {
    onSuccess: (res: unknown) => {
      const r = res as { requeued?: number; synced?: number };
      enqueueSnackbar(
        `Re-queued ${r.requeued ?? 0} sync${(r.requeued ?? 0) === 1 ? '' : 's'}` +
          (r.synced ? ` · ${r.synced} synced now` : ''),
        { variant: 'success' },
      );
      qc.invalidateQueries(['birthwave-website-leads']);
      qc.invalidateQueries(['birthwave-website-lead']);
    },
    onError: (error) => {
      enqueueSnackbar(errorMessage(error, 'Failed to re-queue sheet syncs'), { variant: 'error' });
    },
  });
};
