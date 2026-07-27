import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type {
  CreateVlsConsumerProtectionLawMasterClassPayload,
  VlsConsumerProtectionLawMasterClassListParams,
} from 'types/vlsConsumerProtectionLawMasterClass';
import type { VlsConsumerProtectionLawMasterClassFormValues } from 'schemas/vlsConsumerProtectionLawMasterClassSchema';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const VLS_CONSUMER_PROTECTION_COLOR = '#1F6B40';
export const VLS_CONSUMER_PROTECTION_PAYMENT_STATUS_OPTIONS = [
  'paid',
  'attempted',
  'failed',
  'cancelled',
] as const;

export const formatVlsConsumerProtectionDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : '-';
};

export const formatVlsConsumerProtectionDate = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : '-';
};

export const formatVlsConsumerProtectionAmount = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `\u20B9${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCaptured = (value?: boolean | null): string => {
  if (value === null || value === undefined) return '-';
  return value ? 'Yes' : 'No';
};

const toOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const cleanVlsConsumerProtectionPayload = (
  values: VlsConsumerProtectionLawMasterClassFormValues,
): CreateVlsConsumerProtectionLawMasterClassPayload => ({
  name: values.name.trim(),
  mobile: values.mobile.trim(),
  email: toOptionalText(values.email),
  city: toOptionalText(values.city),
  profession: toOptionalText(values.profession),
  amount: values.amount.trim() || null,
  registered_date: values.registered_date || null,
  programm_date: values.programm_date || null,
  payment_status: toOptionalText(values.payment_status),
  captured: values.captured === '' ? null : values.captured === 'true',
  page_name: toOptionalText(values.page_name),
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
  utm_medium: toOptionalText(values.utm_medium),
  utm_campaign: toOptionalText(values.utm_campaign),
  utm_term: toOptionalText(values.utm_term),
  utm_content: toOptionalText(values.utm_content),
});

export const hasVlsConsumerProtectionFilters = (params: VlsConsumerProtectionLawMasterClassListParams): boolean =>
  Boolean(
    params.search ||
      params.payment_status ||
      (params.captured !== undefined && params.captured !== '') ||
      params.page_name ||
      params.utm_source ||
      params.registered_start_date ||
      params.registered_end_date ||
      params.programm_start_date ||
      params.programm_end_date,
  );

export const getVlsConsumerProtectionLawErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getVlsConsumerProtectionLawErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while processing the request.',
): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const response = (error as AxiosError<BackendErrorPayload>).response;
  const status = response?.status;
  const backendMessage = response?.data?.message;
  if (status === 400) return backendMessage || 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested registration was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Something went wrong while processing the request.';
  return backendMessage || fallback;
};

export const getVlsConsumerProtectionExportErrorMessage = (error: unknown): string => {
  const status = getVlsConsumerProtectionLawErrorStatus(error);
  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export Consumer Protection Law registrations.';
  return getVlsConsumerProtectionLawErrorMessage(error, 'Unable to export registrations.');
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

export const getVlsConsumerProtectionExportFallbackName = (format: 'csv' | 'pdf'): string => {
  const date = dayjs().format('YYYY-MM-DD');
  return `vls-consumer-protection-law-registrations-${date}.${format}`;
};
