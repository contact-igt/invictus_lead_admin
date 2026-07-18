import axios, { AxiosError } from 'axios';
import type { ShantiEyeTechListParams, CreateShantiEyeTechLeadPayload } from 'types/shantiEyeTech';
import { formatAppDateTime, getAppDateKey } from 'utils/dateTime';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const SHANTI_EYE_TECH_COLOR = '#1F6B40';

export const SHANTI_EYE_TECH_SERVICES = [
  'Cataract',
  'Lasik',
  'Pediatric',
  'Glaucoma',
  'Retina',
] as const;

export type ShantiEyeTechService = (typeof SHANTI_EYE_TECH_SERVICES)[number];

export const formatShantiEyeTechDateTime = (value?: string | null): string =>
  formatAppDateTime(value) || '-';

const toOptionalText = (value: string): string | null => value.trim() || null;

export const cleanShantiEyeTechPayload = (values: {
  name: string;
  mobile_number: string;
  service: string;
  message: string;
  ip_address: string;
  utm_source: string;
}): CreateShantiEyeTechLeadPayload => ({
  name: values.name.trim(),
  mobile_number: values.mobile_number.trim(),
  service: toOptionalText(values.service),
  message: toOptionalText(values.message),
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
});

export const hasShantiEyeTechFilters = (params: ShantiEyeTechListParams): boolean =>
  Boolean(params.search || params.service || params.utm_source || params.start_date || params.end_date);

export const getShantiEyeTechErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getShantiEyeTechErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while processing the request.',
): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const response = (error as AxiosError<BackendErrorPayload>).response;
  const status = response?.status;
  const backendMessage = response?.data?.message;
  if (backendMessage === 'Client context not found') {
    return 'Shanti Eye Tech client context was not found. Please verify the client setup.';
  }
  if (backendMessage === 'Route not found') return 'Shanti Eye Tech API route was not found.';
  if (backendMessage) return backendMessage;
  if (status === 400) return 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested Shanti Eye Tech lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'The Shanti Eye Tech service is temporarily unavailable.';
  return fallback;
};

export const getShantiEyeTechExportErrorMessage = (error: unknown): string => {
  const status = getShantiEyeTechErrorStatus(error);
  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export Shanti Eye Tech leads.';
  return getShantiEyeTechErrorMessage(error, 'Unable to export Shanti Eye Tech leads.');
};

export const extractDownloadFilename = (contentDisposition?: string, fallback = 'download'): string => {
  if (!contentDisposition) return fallback;
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1] || fallback;
};

export const getShantiEyeTechExportFallbackName = (format: 'csv' | 'pdf'): string =>
  `shanti-eye-tech-leads-${getAppDateKey()}.${format}`;