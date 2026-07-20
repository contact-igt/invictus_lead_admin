import { useQuery } from 'react-query';
import { ApiLogFilters, getApiLogById, getApiLogs, getApiLogSummary } from 'services/apiLogs.service';

export const apiLogKeys = {
  list: (filters: ApiLogFilters) => ['api-logs', filters] as const,
  summary: (filters: ApiLogFilters) => ['api-logs', 'summary', filters] as const,
  detail: (id: number | null) => ['api-logs', 'detail', id] as const,
};

export const useApiLogs = (filters: ApiLogFilters) =>
  useQuery(apiLogKeys.list(filters), () => getApiLogs(filters), {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

export const useApiLogSummary = (filters: ApiLogFilters) =>
  useQuery(apiLogKeys.summary(filters), () => getApiLogSummary(filters), {
    refetchOnWindowFocus: false,
  });

export const useApiLog = (id: number | null) =>
  useQuery(apiLogKeys.detail(id), () => getApiLogById(id as number), {
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
