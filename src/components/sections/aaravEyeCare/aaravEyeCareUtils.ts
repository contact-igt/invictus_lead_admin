import axios, { AxiosError } from 'axios';
import { formatAppDateTime, getAppDateKey } from 'utils/dateTime';
import type {
  AaravEyeCareListParams,
  CreateAaravEyeCareLeadPayload,
} from 'types/aaravEyeCare';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const AARAV_EYE_CARE_COLOR = '#1F6B40';

export const AARAV_EYE_CARE_SERVICES = [
  'General Ophthalmology',
  'Pediatric Ophthalmology',
  'Retina Eye Care',
  'Glaucoma Services',
  'Neuro Ophthalmology',
  'Lasik - Specs Removal',
  'SMILE - Specs Removal',
  'ICL - Specs Removal',
  'Cataract Surgery',
  'Oculoplasty Treatment',
] as const;

export type AaravEyeCareService = (typeof AARAV_EYE_CARE_SERVICES)[number];

export const formatAaravDateTime = (value?: string | null): string => {
  return formatAppDateTime(value) || '-';
};

export const toOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const cleanAaravPayload = (values: {
  name: string;
  mobile_number: string;
  service: string;
  ip_address: string;
  utm_source: string;
}): CreateAaravEyeCareLeadPayload => ({
  name: values.name.trim(),
  mobile_number: values.mobile_number.trim(),
  service: toOptionalText(values.service),
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
});

export const hasAaravFilters = (params: AaravEyeCareListParams): boolean =>
  Boolean(
    params.search ||
      params.service ||
      params.utm_source ||
      params.start_date ||
      params.end_date,
  );

export const getAaravErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getAaravErrorMessage = (
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
  if (status === 404) return 'The requested Aarav Eye Care lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Something went wrong while processing the request.';

  return backendMessage || fallback;
};

export const getAaravExportErrorMessage = (error: unknown): string => {
  const status = getAaravErrorStatus(error);

  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export Aarav Eye Care leads.';

  return getAaravErrorMessage(error, 'Unable to export Aarav Eye Care leads.');
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

export const getAaravExportFallbackName = (format: 'csv' | 'pdf'): string => {
  return `aarav-eye-care-leads-${getAppDateKey()}.${format}`;
};

