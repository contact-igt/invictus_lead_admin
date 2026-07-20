import { _axios } from 'helper/axios';

export interface ApiLog {
  id: number;
  request_id: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  user_id?: number | null;
  user_email?: string | null;
  user_role?: string | null;
  client_id?: number | null;
  ip_address?: string | null;
  request_body?: unknown;
  response_body?: unknown;
  error_message?: string | null;
  created_at: string;
}

export interface ApiLogFilters {
  page?: number;
  limit?: number;
  method?: string;
  status?: string;
  path?: string;
  start_date?: string;
  end_date?: string;
}

export const getApiLogs = (params: ApiLogFilters) =>
  _axios('get', '/api-logs', undefined, 'application/json', params);

export const getApiLogSummary = (params: ApiLogFilters) =>
  _axios('get', '/api-logs/summary', undefined, 'application/json', params);

export const getApiLogById = (id: number) =>
  _axios('get', `/api-logs/${id}`);
