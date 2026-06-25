import { useQuery, useMutation, useQueryClient } from 'react-query';
import { _axios } from 'helper/axios';
import { useSnackbar } from 'notistack';

interface PixelEyeNotificationsQueryOptions {
  enabled?: boolean;
}

export interface NotificationState {
  id: number;
  call_id: string;
  client_id: number;
  customer_name?: string;
  phone_number?: string;
  agent_name?: string;
  last_status?: string;
  state: 'new' | 'baseline' | 'scheduled' | 'completed' | 'cancelled';
  schedule_type?: 'THIRTY_MIN' | 'DNP2' | 'TWENTY_FOUR_HR' | 'FORTY_EIGHT_HR' | 'MANUAL' | null;
  reason?: string;
  scheduled_at?: string;
  notification_sent: boolean;
  notification_sent_at?: string;
  thirty_min_cycle_completed: boolean;
  permanently_closed: boolean;
  cancel_reason?: string;
  day1_mode: 'auto' | 'manual';
  completion_source?: 'NOTIFICATION_SENT' | 'MANUAL_HANDLED' | null;
  compliance_status?: 'PENDING' | 'CALLED' | 'MISSED' | 'IGNORED' | 'CANCELLED' | null;
  current_day?: number | null;
  day_1?: string | null;
  day_2?: string | null;
  day_3?: string | null;
  day_4?: string | null;
  day_5?: string | null;
  outcome_status?: 'Outcome Updated' | 'Outcome Pending' | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSummary {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

const extractData = <T,>(res: any): T => {
  if (Array.isArray(res)) return res as T;
  if (Array.isArray(res?.data)) return res.data as T;
  if (res?.data !== undefined) return res.data as T;
  return (res ?? []) as T;
};

export const usePixelEyeNotificationsQuery = (
  clientKey?: string,
  filters?: { state?: string; schedule_type?: string },
  options?: PixelEyeNotificationsQueryOptions,
) =>
  useQuery<NotificationState[]>(
    [
      'pixelEyeNotifications',
      clientKey ?? null,
      filters?.state ?? null,
      filters?.schedule_type ?? null,
    ],
    async () => {
      const params: Record<string, string> = {};
      if (clientKey) params._client_key = clientKey;
      if (filters?.state) params.state = filters.state;
      if (filters?.schedule_type) params.schedule_type = filters.schedule_type;
      const res = await _axios(
        'get',
        '/pixeleye/notifications',
        undefined,
        'application/json',
        params,
      );
      return extractData<NotificationState[]>(res);
    },
    {
      enabled: options?.enabled ?? true,
      retry: (failureCount: number, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
    },
  );

export const usePixelEyeNotificationsSummaryQuery = (
  clientKey?: string,
  options?: PixelEyeNotificationsQueryOptions,
) =>
  useQuery<NotificationSummary>(
    ['pixelEyeNotificationsSummary', clientKey ?? null],
    async () => {
      const params = clientKey ? { _client_key: clientKey } : undefined;
      const res = await _axios(
        'get',
        '/pixeleye/notifications/summary',
        undefined,
        'application/json',
        params,
      );
      return extractData<NotificationSummary>(res);
    },
    {
      enabled: options?.enabled ?? true,
      retry: (failureCount: number, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
    },
  );

export const useDeletePixelEyeNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    ({ ids, clientKey }: { ids: number[]; clientKey?: string }) => {
      const params = clientKey ? { _client_key: clientKey } : undefined;
      return _axios(
        'delete',
        '/pixeleye/notifications',
        { ids },
        'application/json',
        params,
      ) as Promise<{ message?: string; data?: { deletedCount?: number } }>;
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('pixelEyeNotifications');
        queryClient.invalidateQueries('pixelEyeNotificationsSummary');
        enqueueSnackbar(response?.message || 'Notifications deleted successfully', {
          variant: 'success',
        });
      },
      onError: (err: any) => {
        enqueueSnackbar(
          err?.response?.data?.message || err?.message || 'Failed to delete notifications',
          { variant: 'error' },
        );
      },
    },
  );
};
