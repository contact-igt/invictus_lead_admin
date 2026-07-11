import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { PixelEyeWebsiteLeadListParams, CreatePixelEyeWebsiteLeadPayload } from 'types/pixelEyeWebsiteLead';

interface BackendErrorPayload {
  message?: string;
  details?: Array<string | { message?: string }>;
}

export const PIXEL_EYE_WEBSITE_LEADS_COLOR = '#1F6B40';

export const PIXEL_EYE_WEBSITE_LEAD_SERVICES = [
  'Cataract',
  'Lasik',
  'Squint',
  'Retina',
  'Glaucoma',
  'Keratoconus',
  'Pediatric',
] as const;

export type PixelEyeWebsiteLeadService = (typeof PIXEL_EYE_WEBSITE_LEAD_SERVICES)[number];

export const formatPixelEyeWebsiteLeadDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : '-';
};

export const toOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const cleanPixelEyeWebsiteLeadPayload = (values: {
  name: string;
  mobile_number: string;
  service: string;
  ip_address: string;
  utm_source: string;
}): CreatePixelEyeWebsiteLeadPayload => ({
  name: values.name.trim(),
  mobile_number: values.mobile_number.trim(),
  service: (values.service.trim() || null) as CreatePixelEyeWebsiteLeadPayload['service'],
  ip_address: toOptionalText(values.ip_address),
  utm_source: toOptionalText(values.utm_source),
});

export const hasPixelEyeWebsiteLeadFilters = (params: PixelEyeWebsiteLeadListParams): boolean =>
  Boolean(
    params.search ||
      params.service ||
      params.utm_source ||
      params.start_date ||
      params.end_date,
  );

export const getPixelEyeWebsiteLeadErrorStatus = (error: unknown): number | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  return (error as AxiosError<BackendErrorPayload>).response?.status;
};

export const getPixelEyeWebsiteLeadErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong while processing the request.',
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const response = (error as AxiosError<BackendErrorPayload>).response;
  const status = response?.status;
  const backendMessage = response?.data?.message;

  if (backendMessage === 'Client context not found') {
    return 'PixelEye client context was not found. Please verify the client setup.';
  }
  if (backendMessage === 'Route not found') {
    return 'PixelEye Website Leads API route was not found.';
  }
  if (backendMessage) return backendMessage;

  if (status === 400) return backendMessage || 'Please check the submitted information.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested PixelEye Website Lead was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Something went wrong while processing the request.';

  return backendMessage || fallback;
};

export const getPixelEyeWebsiteLeadExportErrorMessage = (error: unknown): string => {
  const status = getPixelEyeWebsiteLeadErrorStatus(error);

  if (status === 403) return 'You do not have permission to export this data.';
  if (status === 404) return 'No matching records were found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  if (status && status >= 500) return 'Unable to export PixelEye Website Leads.';

  return getPixelEyeWebsiteLeadErrorMessage(error, 'Unable to export PixelEye Website Leads.');
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

export const getPixelEyeWebsiteLeadExportFallbackName = (format: 'csv' | 'pdf'): string => {
  const date = dayjs().format('YYYY-MM-DD');
  return `pixel-eye-website-leads-${date}.${format}`;
};


