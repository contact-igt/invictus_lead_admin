import { useQuery } from 'react-query';
import { _axios } from 'helper/axios';

export interface NotificationState {
  id: number;
  call_id: string;
  client_id: number;
  customer_name?: string;
  phone_number?: string;
  agent_name?: string;
  last_status?: string;
  state: 'new' | 'baseline' | 'scheduled' | 'completed' | 'cancelled';
  schedule_type?: 'THIRTY_MIN' | 'DNP2' | 'TWENTY_FOUR_HR' | null;
  reason?: string;
  scheduled_at?: string;
  notification_sent: boolean;
  notification_sent_at?: string;
  thirty_min_cycle_completed: boolean;
  permanently_closed: boolean;
  cancel_reason?: string;
  day1_mode: 'auto' | 'manual';
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
) =>
  useQuery<NotificationState[]>(
    ['pixelEyeNotifications', clientKey ?? null, filters ?? null],
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
    { refetchInterval: 30000 },
  );

export const usePixelEyeNotificationsSummaryQuery = (clientKey?: string) =>
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
    { refetchInterval: 30000 },
  );
