import axios, { AxiosError } from 'axios';
import { formatAppDateTime, getAppDateKey } from 'utils/dateTime';
import type {
  AntardrashtiNetralayaListParams,
  CreateAntardrashtiNetralayaLeadPayload,
} from 'types/antardrashtiNetralaya';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const ANTARDRASHTI_NETRALAYA_COLOR = '#1F6B40';

export const ANTARDRASHTI_NETRALAYA_SERVICES = [
  'Cataract',
  'Lasik',
] as const;

export type AntardrashtiNetralayaService = (typeof ANTARDRASHTI_NETRALAYA_SERVICES)[number];

export const formatAntardrashtiDateTime = (value?: string | null): string => {
  return formatAppDateTime(value) || '-';
};

export const toOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const cleanAntardrashtiPayload = (values: {
  name: string;
  mobile_number: string;
  service: string;
  ip_address: string;
  utm_source: string;
}): CreateAntardrashtiNetralayaLeadPayload => ({
  name: values.name.trim(),
  mobile_number: values.mobile_number.trim(),
  service: (values.service.trim() || null) as CreateAntardrashtiNetralayaLeadPayload['service'],
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
});

export const hasAntardrashtiFilters = (params: AntardrashtiNetralayaListParams): boolean =>
  Boolean(
    params.search ||
      params.service ||
      params.utm_source ||
      params.start_date ||
      params.end_date,
  );

export const getAntardrashtiErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getAntardrashtiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while processing the request.',
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const response = (error as AxiosError<BackendErrorPayload>).response;
  const status = response?.status;
  const backendMessage = response?.data?.message;

  if (backendMessage === 'Client context not found') {
    return 'Antardrashti Netralaya client context was not found. Please verify the client setup.';
  }
  if (backendMessage === 'Route not found') {
    return 'Antardrashti Netralaya API route was not found.';
  }
  if (backendMessage) return backendMessage;

  if (status === 400) return backendMessage || 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested Antardrashti Netralaya lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Something went wrong while processing the request.';

  return backendMessage || fallback;
};

export const getAntardrashtiExportErrorMessage = (error: unknown): string => {
  const status = getAntardrashtiErrorStatus(error);

  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export Antardrashti Netralaya leads.';

  return getAntardrashtiErrorMessage(error, 'Unable to export Antardrashti Netralaya leads.');
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

export const getAntardrashtiExportFallbackName = (format: 'csv' | 'pdf'): string => {
  return `antardrashti-netralaya-leads-${getAppDateKey()}.${format}`;
};





