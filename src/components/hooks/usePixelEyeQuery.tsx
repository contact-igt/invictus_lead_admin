import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { _axios } from 'helper/axios';

export interface PixelEyeLead {
  id: number;
  client_id?: number | null;
  date?: string;
  time?: string;
  call_id?: string;
  customer_name?: string;
  phone_number?: string;
  agent_name?: string;
  notes?: string | null;
  status?: string;
  day_1?: string;
  day_2?: string;
  day_3?: string;
  day_4?: string;
  day_5?: string;
  source?: string;
  type_of_enquiry?: string;
  follow_up_date?: string;
  followup_highlight_state?: string | null;
  called_outcome_missing?: boolean | null;
  compliance_status?: string | null;
  latest_raw_status?: string | null;
  latest_call_time?: string | null;
  matched_call_log_id?: number | null;
  matched_call_id?: string | null;
  matched_call_started_at?: string | null;
  normal_lead_attention_state?: string | null;
  normal_lead_attention_label?: string | null;
  needs_manual_day_outcome?: boolean | null;
  follow_up_change_count?: number | string | null;
  followup_state?: 'scheduled' | 'completed' | 'cancelled' | 'baseline' | 'new' | null;
  reminder_schedule_type?:
  | 'THIRTY_MIN'
  | 'DNP2'
  | 'TWENTY_FOUR_HR'
  | 'FORTY_EIGHT_HR'
  | 'MANUAL'
  | null;
  reminder_scheduled_at?: string | null;
  reminder_notification_sent?: boolean | null;
  reminder_notification_sent_at?: string | null;
  reminder_reason?: string | null;
  reminder_permanently_closed?: boolean | null;
  latest_follow_up_change_at?: string | null;
  reminder_cancel_reason?: string | null;
  followup_completion_source?: 'NOTIFICATION_SENT' | 'MANUAL_HANDLED' | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreatePixelEyePayload {
  date: string;
  time: string;
  call_id: string;
  customer_name: string;
  phone_number: string;
  agent_name: string;
  notes?: string | null;
  status: string;
  source?: string;
  type_of_enquiry?: string;
  follow_up_date?: string;
  day_1?: string;
  day_2?: string;
  day_3?: string;
  day_4?: string;
  day_5?: string;
  _client_key?: string;
}

export interface UpdatePixelEyePayload {
  id: number;
  clientKey?: string;
  status?: string;
  date?: string;
  time?: string;
  call_id?: string;
  customer_name?: string;
  phone_number?: string;
  agent_name?: string;
  notes?: string | null;
  source?: string;
  type_of_enquiry?: string;
  follow_up_date?: string;
  day_1?: string;
  day_2?: string;
  day_3?: string;
  day_4?: string;
  day_5?: string;
}

export interface ReschedulePixelEyeFollowUpPayload {
  id: number;
  clientKey?: string;
  follow_up_date: string;
  reason?: string;
}

export interface CancelPixelEyeFollowUpPayload {
  id: number;
  clientKey?: string;
  status?: string;
  reason?: string;
}

export interface UpdatePixelEyeFollowUpOutcomePayload {
  id: string | number;
  clientKey?: string;
  status: string;
}

interface PixelEyeQueryOptions {
  enabled?: boolean;
}

export interface PixelEyeFollowUpOutcomeResponse {
  success: boolean;
  message: string;
  data: {
    lead: PixelEyeLead;
    updated_day: string;
    status: string;
  };
}

export interface PixelEyeFollowUpCallComplianceRow {
  id: number;
  lead_id?: number | null;
  call_id?: string | null;
  phone_number?: string | null;
  normalized_phone_number?: string | null;
  customer_name?: string | null;
  agent_name?: string | null;
  scheduled_follow_up_date?: string | null;
  scheduled_follow_up_at?: string | null;
  allowed_until?: string | null;
  compliance_status?: string | null;
  matched_call_log_id?: number | null;
  matched_call_id?: string | null;
  matched_call_started_at?: string | null;
  reason?: string | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PixelEyeFollowUpCallComplianceSummary {
  total: number;
  pending: number;
  called: number;
  missed: number;
  ignored: number;
  cancelled: number;
}

export interface PixelEyeFollowUpLifecycleSummary {
  active_manual: number;
  missed: number;
  completed_done: number;
  called_outcome_missing: number;
  needs_review: number;
  rescheduled: number;
  cancelled: number;
  reminders_sent: number;
  outcomes_saved: number;
}

const EMPTY_PIXEL_EYE_FOLLOW_UP_LIFECYCLE_SUMMARY: PixelEyeFollowUpLifecycleSummary = {
  active_manual: 0,
  missed: 0,
  completed_done: 0,
  called_outcome_missing: 0,
  needs_review: 0,
  rescheduled: 0,
  cancelled: 0,
  reminders_sent: 0,
  outcomes_saved: 0,
};

const EMPTY_PIXEL_EYE_FOLLOW_UP_COMPLIANCE_SUMMARY: PixelEyeFollowUpCallComplianceSummary = {
  total: 0,
  pending: 0,
  called: 0,
  missed: 0,
  ignored: 0,
  cancelled: 0,
};

const refreshPixelEyeCaches = (queryClient: ReturnType<typeof useQueryClient>) => {
  const queryKeys = [
    ['pixelEyeLeads'],
    ['pixelEyeLead'],
    ['pixelEyeNotifications'],
    ['pixelEyeNotificationsSummary'],
    ['pixelEyeFollowUpCallComplianceSummary'],
    ['pixelEyeFollowUpLifecycleSummary'],
    ['pixelEyeMissedFollowUps'],
    ['pixelEyeFollowUpHistory'],
    ['pixelEyeFollowUpCallCompliance'],
  ] as const;

  queryKeys.forEach((key) => {
    queryClient.invalidateQueries(key);
  });

  // Also invalidate by prefix string so scoped keys like ['pixelEyeLeads', clientKey] are refreshed
  const prefixKeys = ['pixelEyeLeads', 'pixelEyeLead', 'pixelEyeNotifications', 'pixelEyeNotificationsSummary', 'pixelEyeFollowUpCallComplianceSummary', 'pixelEyeFollowUpLifecycleSummary', 'pixelEyeMissedFollowUps', 'pixelEyeFollowUpHistory', 'pixelEyeFollowUpCallCompliance'];
  prefixKeys.forEach((k) => queryClient.invalidateQueries(k));

  try {
    queryKeys.forEach((key) => {
      queryClient.refetchQueries(key);
    });
  } catch {
    // Best-effort refresh only; invalidation above still marks the data stale.
  }
};

// clientKey is included in the query key so super-admin switching between clients
// gets a fresh fetch instead of returning the previous client's cached data.
export const usePixelEyeQuery = (clientKey?: string, options?: PixelEyeQueryOptions) =>
  useQuery<PixelEyeLead[]>(['pixelEyeLeads', clientKey ?? null], async () => {
    const params = clientKey ? { _client_key: clientKey } : undefined;
    const res = await _axios('get', '/pixeleye', undefined, 'application/json', params);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('usePixelEyeQuery - raw response', res);
    }
    if (Array.isArray(res)) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('usePixelEyeQuery - returning array length', res.length);
      }
      return res as PixelEyeLead[];
    }
    if (Array.isArray(res?.data)) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('usePixelEyeQuery - returning res.data length', res.data.length);
      }
      return res.data as PixelEyeLead[];
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('usePixelEyeQuery - returning fallback value', res ?? []);
    }
    return (res ?? []) as PixelEyeLead[];
  }, {
    enabled: options?.enabled ?? true,
    // Avoid aggressive refetching and retries that can cause loops / 429 storms
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 429) return false;
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true,
  });

export const usePixelEyeMissedFollowUpsQuery = (
  clientKey?: string,
  filters?: { from?: string; to?: string; agent_name?: string },
  options?: PixelEyeQueryOptions,
) =>
  useQuery<PixelEyeFollowUpCallComplianceRow[]>(
    [
      'pixelEyeMissedFollowUps',
      clientKey ?? null,
      filters?.from ?? null,
      filters?.to ?? null,
      filters?.agent_name ?? null,
    ],
    async () => {
      const params: Record<string, string> = {};
      if (clientKey) params._client_key = clientKey;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.agent_name) params.agent_name = filters.agent_name;
      const res = await _axios(
        'get',
        '/pixeleye/follow-ups/missed-calls',
        undefined,
        'application/json',
        Object.keys(params).length > 0 ? params : undefined,
      );
      if (Array.isArray(res)) {
        return res as PixelEyeFollowUpCallComplianceRow[];
      }
      if (Array.isArray(res?.data)) {
        return res.data as PixelEyeFollowUpCallComplianceRow[];
      }
      return (res?.data ?? res ?? []) as PixelEyeFollowUpCallComplianceRow[];
    },
    {
      enabled: options?.enabled ?? true,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
      keepPreviousData: true,
    },
  );

export const usePixelEyeFollowUpCallComplianceSummaryQuery = (
  clientKey?: string,
  filters?: { from?: string; to?: string; agent_name?: string },
  options?: PixelEyeQueryOptions,
) =>
  useQuery<PixelEyeFollowUpCallComplianceSummary>(
    [
      'pixelEyeFollowUpCallComplianceSummary',
      clientKey ?? null,
      filters?.from ?? null,
      filters?.to ?? null,
      filters?.agent_name ?? null,
    ],
    async () => {
      const params: Record<string, string> = {};
      if (clientKey) params._client_key = clientKey;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.agent_name) params.agent_name = filters.agent_name;

      const res = await _axios(
        'get',
        '/pixeleye/follow-ups/call-compliance-summary',
        undefined,
        'application/json',
        Object.keys(params).length > 0 ? params : undefined,
      );

      const summary = (res?.data ?? res ?? {}) as Partial<PixelEyeFollowUpCallComplianceSummary>;

      return {
        total: Number(summary.total || 0),
        pending: Number(summary.pending || 0),
        called: Number(summary.called || 0),
        missed: Number(summary.missed || 0),
        ignored: Number(summary.ignored || 0),
        cancelled: Number(summary.cancelled || 0),
      };
    },
    {
      enabled: options?.enabled ?? true,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
      keepPreviousData: true,
      initialData: EMPTY_PIXEL_EYE_FOLLOW_UP_COMPLIANCE_SUMMARY,
    },
  );

export const usePixelEyeFollowUpLifecycleSummaryQuery = (
  clientKey?: string,
  filters?: { from?: string; to?: string },
  options?: PixelEyeQueryOptions,
) =>
  useQuery<PixelEyeFollowUpLifecycleSummary>(
    [
      'pixelEyeFollowUpLifecycleSummary',
      clientKey || 'tenant',
      filters?.from ?? null,
      filters?.to ?? null,
    ],
    async () => {
      const params: Record<string, string> = {};
      if (clientKey) params._client_key = clientKey;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      const res = await _axios(
        'get',
        '/pixeleye/follow-ups/lifecycle-summary',
        undefined,
        'application/json',
        Object.keys(params).length > 0 ? params : undefined,
      );

      const summary =
        (res?.data ?? res ?? {}) as Partial<PixelEyeFollowUpLifecycleSummary>;

      return {
        active_manual: Number(summary.active_manual || 0),
        missed: Number(summary.missed || 0),
        completed_done: Number(summary.completed_done || 0),
        called_outcome_missing: Number(summary.called_outcome_missing || 0),
        needs_review: Number(summary.needs_review || 0),
        rescheduled: Number(summary.rescheduled || 0),
        cancelled: Number(summary.cancelled || 0),
        reminders_sent: Number(summary.reminders_sent || 0),
        outcomes_saved: Number(summary.outcomes_saved || 0),
      };
    },
    {
      enabled: options?.enabled ?? true,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
      keepPreviousData: true,
      initialData: EMPTY_PIXEL_EYE_FOLLOW_UP_LIFECYCLE_SUMMARY,
    },
  );

export const usePixelEyeLeadQuery = (
  leadId?: string | number,
  clientKey?: string,
  options?: PixelEyeQueryOptions,
) =>
  useQuery<PixelEyeLead | null>(
    ['pixelEyeLead', leadId ?? null, clientKey ?? null],
    async () => {
      if (leadId === undefined || leadId === null || String(leadId).trim() === '') {
        return null;
      }

      const params = clientKey ? { _client_key: clientKey } : undefined;
      const res = await _axios('get', `/pixeleye/${leadId}`, undefined, 'application/json', params);
      if (res?.data) {
        return res.data as PixelEyeLead;
      }
      if (res && typeof res === 'object' && !Array.isArray(res)) {
        return res as PixelEyeLead;
      }
      return null;
    },
    {
      enabled: Boolean(leadId) && (options?.enabled ?? true),
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
    },
  );

export const useCreatePixelEyeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: CreatePixelEyePayload) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('useCreatePixelEyeMutation - request payload', payload);
      }
      return _axios('post', '/pixeleye', payload).then((res) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCreatePixelEyeMutation - response', res);
        }
        return res;
      });
    },
    {
      onMutate: (vars) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCreatePixelEyeMutation - onMutate', vars);
        }
      },
      onSuccess: (data) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCreatePixelEyeMutation - onSuccess', data);
        }
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCreatePixelEyeMutation - onError', err);
        }
      },
    },
  );
};

export const useUpdatePixelEyeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, clientKey, ...payload }: UpdatePixelEyePayload) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('useUpdatePixelEyeMutation - request id,payload', id, payload);
      }
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios('patch', `/pixeleye/${id}`, payload, 'application/json', params).then((res) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useUpdatePixelEyeMutation - response', res);
        }
        return res;
      });
    },
    {
      onMutate: (vars) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useUpdatePixelEyeMutation - onMutate', vars);
        }
      },
      onSuccess: (data) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useUpdatePixelEyeMutation - onSuccess', data);
        }
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useUpdatePixelEyeMutation - onError', err);
        }
      },
    },
  );
};

export const useDeletePixelEyeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, clientKey }: { id: number; clientKey?: string }) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('useDeletePixelEyeMutation - request id', id);
      }
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios('delete', `/pixeleye/${id}`, undefined, 'application/json', params).then((res) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useDeletePixelEyeMutation - response', res);
        }
        return res;
      });
    },
    {
      onMutate: (vars) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useDeletePixelEyeMutation - onMutate', vars);
        }
      },
      onSuccess: (data) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useDeletePixelEyeMutation - onSuccess', data);
        }
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useDeletePixelEyeMutation - onError', err);
        }
      },
    },
  );
};

export const useReschedulePixelEyeFollowUpMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, clientKey, ...payload }: ReschedulePixelEyeFollowUpPayload) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('useReschedulePixelEyeFollowUpMutation - request', id, payload);
      }
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios('patch', `/pixeleye/${id}/follow-up/reschedule`, payload, 'application/json', params).then((res) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useReschedulePixelEyeFollowUpMutation - response', res);
        }
        return res;
      });
    },
    {
      onSuccess: (data) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useReschedulePixelEyeFollowUpMutation - onSuccess', data);
        }
        enqueueSnackbar('Follow-up rescheduled', { variant: 'success' });
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err: any) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useReschedulePixelEyeFollowUpMutation - onError', err);
        }
        enqueueSnackbar(
          err?.response?.data?.message || err?.message || 'Failed to reschedule follow-up',
          {
            variant: 'error',
          },
        );
      },
    },
  );
};

export const useUpdatePixelEyeFollowUpOutcomeMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation<
    PixelEyeFollowUpOutcomeResponse,
    unknown,
    UpdatePixelEyeFollowUpOutcomePayload
  >(
    ({ id, clientKey, status }) => {
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios(
        'patch',
        `/pixeleye/${id}/follow-up-outcome`,
        { status },
        'application/json',
        params,
      ) as Promise<PixelEyeFollowUpOutcomeResponse>;
    },
    {
      onSuccess: (response) => {
        enqueueSnackbar(`Outcome saved in ${response.data.updated_day}`, { variant: 'success' });
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        enqueueSnackbar(
          error.response?.data?.message || error.message || 'Failed to update follow-up outcome',
          { variant: 'error' },
        );
      },
    },
  );
};

export const useCancelPixelEyeFollowUpMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ id, clientKey, ...payload }: CancelPixelEyeFollowUpPayload) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('useCancelPixelEyeFollowUpMutation - request', id, payload);
      }
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios('patch', `/pixeleye/${id}/follow-up/cancel`, payload, 'application/json', params).then((res) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCancelPixelEyeFollowUpMutation - response', res);
        }
        return res;
      });
    },
    {
      onSuccess: (data) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCancelPixelEyeFollowUpMutation - onSuccess', data);
        }
        enqueueSnackbar('Follow-up closed/cancelled', { variant: 'success' });
        refreshPixelEyeCaches(queryClient);
      },
      onError: (err: any) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('useCancelPixelEyeFollowUpMutation - onError', err);
        }
        enqueueSnackbar(
          err?.response?.data?.message || err?.message || 'Failed to cancel follow-up',
          {
            variant: 'error',
          },
        );
      },
    },
  );
};



