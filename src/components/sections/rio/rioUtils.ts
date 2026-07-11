import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type {
  RioListParams,
  CreateRioLeadPayload,
} from 'types/rio';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const RIO_COLOR = '#1F6B40';

export const RIO_SERVICES = [
  'High-Risk Pregnancy Care', 'Fetal Medicine', 'NICU', 'PICU',
  'Paediatric Emergency Care', 'General Paediatrics', 'Vaccination Services',
  'Human Milk Bank', 'Maternity Care', 'Fertility & IVF',
] as const;

export const RIO_BRANCHES = [
  'Madurai (Main)', 'Southwing, Madurai', 'Dindigul', 'Thanjavur',
] as const;

export type RioService = (typeof RIO_SERVICES)[number];

export const formatRioDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : '-';
};

export const toOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const cleanRioPayload = (values: {
  name: string;
  mobile_number: string;
  service: string;
  branch: string;
  message: string;
  ip_address: string;
  utm_source: string;
}): CreateRioLeadPayload => ({
  name: values.name.trim(),
  mobile_number: values.mobile_number.trim(),
  service: (values.service.trim() || null) as CreateRioLeadPayload['service'],
  branch: (values.branch.trim() || null) as CreateRioLeadPayload['branch'],
  message: toOptionalText(values.message),
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
});

export const hasRioFilters = (params: RioListParams): boolean =>
  Boolean(
    params.search ||
      params.service ||
      params.branch ||
      params.utm_source ||
      params.start_date ||
      params.end_date,
  );

export const getRioErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getRioErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while processing the request.',
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const response = (error as AxiosError<BackendErrorPayload>).response;
  const status = response?.status;
  const backendMessage = response?.data?.message;

  if (backendMessage === 'Client context not found') {
    return 'Rio client context was not found. Please verify the client setup.';
  }
  if (backendMessage === 'Route not found') {
    return 'Rio API route was not found.';
  }
  if (backendMessage) return backendMessage;

  if (status === 400) return backendMessage || 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested Rio lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Something went wrong while processing the request.';

  return backendMessage || fallback;
};

export const getRioExportErrorMessage = (error: unknown): string => {
  const status = getRioErrorStatus(error);

  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export Rio leads.';

  return getRioErrorMessage(error, 'Unable to export Rio leads.');
};

export const extractDownloadFilename = (
  contentDisposition?: string,
  fallback = 'download',
): string => {
  if (!contentDisposition) return fallback;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (fileNameMatch?.[1]) return fileNameMatch[1];

  return fallback;
};

export const getRioExportFallbackName = (format: 'csv' | 'pdf'): string => {
  const date = dayjs().format('YYYY-MM-DD');
  return `rio-leads-${date}.${format}`;
};





