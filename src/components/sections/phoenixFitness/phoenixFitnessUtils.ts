import axios, { AxiosError } from 'axios';
import type { PhoenixFitnessListParams, CreatePhoenixFitnessLeadPayload } from 'types/phoenixFitness';
import { formatAppDateTime, getAppDateKey } from 'utils/dateTime';

interface BackendErrorPayload { message?: string; details?: Array<string | { message?: string }> }

export const PHOENIX_FITNESS_COLOR = '#1F6B40';

export const PHOENIX_FITNESS_BRANCHES = [
  'Budegere Cross',
  'Kannamangala',
  'Nallurhalli',
  'Yello Living (ITPL)',
  'Hope Farm',
] as const;

export type PhoenixFitnessBranch = (typeof PHOENIX_FITNESS_BRANCHES)[number];
export const formatPhoenixFitnessDateTime = (value?: string | null): string => formatAppDateTime(value) || '-';
const toOptionalText = (value: string): string | null => value.trim() || null;

export const cleanPhoenixFitnessPayload = (values: {
  name: string; mobile_number: string; branch: string; ip_address: string; utm_source: string;
}): CreatePhoenixFitnessLeadPayload => ({
  name: values.name.trim(), mobile_number: values.mobile_number.trim(), branch: toOptionalText(values.branch),
  ip_address: toOptionalText(values.ip_address), utm_source: toOptionalText(values.utm_source),
});

export const hasPhoenixFitnessFilters = (params: PhoenixFitnessListParams): boolean => Boolean(params.search || params.branch || params.utm_source || params.start_date || params.end_date);
export const getPhoenixFitnessErrorStatus = (error: unknown): number | undefined => axios.isAxiosError(error) ? (error as AxiosError<BackendErrorPayload>).response?.status : undefined;
export const getPhoenixFitnessErrorMessage = (error: unknown, fallback = 'Something went wrong while processing the request.'): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const response = (error as AxiosError<BackendErrorPayload>).response;
  const message = response?.data?.message;
  if (message === 'Client context not found') return 'Phoenix Fitness client context was not found. Please verify the client setup.';
  if (message === 'Route not found') return 'Phoenix Fitness API route was not found.';
  if (message) return message;
  const status = response?.status;
  if (status === 400) return 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested Phoenix Fitness lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  return status && status >= 500 ? 'The Phoenix Fitness service is temporarily unavailable.' : fallback;
};
export const getPhoenixFitnessExportErrorMessage = (error: unknown): string => getPhoenixFitnessErrorMessage(error, 'Unable to export Phoenix Fitness leads.');
export const extractDownloadFilename = (contentDisposition?: string, fallback = 'download'): string => {
  if (!contentDisposition) return fallback;
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
};
export const getPhoenixFitnessExportFallbackName = (format: 'csv' | 'pdf'): string => `phoenix-fitness-leads-${getAppDateKey()}.${format}`;