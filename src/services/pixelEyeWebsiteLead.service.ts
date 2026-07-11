import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  PixelEyeWebsiteLeadDeleteResponse,
  PixelEyeWebsiteLeadExportFormat,
  PixelEyeWebsiteLeadExportParams,
  PixelEyeWebsiteLeadListParams,
  PixelEyeWebsiteLeadListResponse,
  PixelEyeWebsiteLeadResponse,
  PixelEyeWebsiteLeadSummaryResponse,
  CreatePixelEyeWebsiteLeadPayload,
  UpdatePixelEyeWebsiteLeadPayload,
} from 'types/pixelEyeWebsiteLead';

type PixelEyeWebsiteLeadQueryParams = Record<string, string | number>;

const cleanListParams = (params: PixelEyeWebsiteLeadListParams): PixelEyeWebsiteLeadQueryParams => {
  const cleaned: PixelEyeWebsiteLeadQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: PixelEyeWebsiteLeadExportParams): PixelEyeWebsiteLeadQueryParams => {
  const cleaned: PixelEyeWebsiteLeadQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: PixelEyeWebsiteLeadQueryParams,
  superAdminClientKey?: string,
): PixelEyeWebsiteLeadQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getPixelEyeWebsiteLeads = async (
  params: PixelEyeWebsiteLeadListParams,
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadListResponse> =>
  (await _axios(
    'get',
    '/pixeleye/website-leads',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as PixelEyeWebsiteLeadListResponse;

export const exportPixelEyeWebsiteLeads = async (
  format: PixelEyeWebsiteLeadExportFormat,
  params: PixelEyeWebsiteLeadExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/pixeleye/website-leads/export',
    undefined,
    'application/json',
    withClientContext(
      {
        format,
        ...cleanExportParams(params),
      },
      superAdminClientKey,
    ),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getPixelEyeWebsiteLeadSummary = async (
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadSummaryResponse> =>
  (await _axios(
    'get',
    '/pixeleye/website-leads/summary',
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PixelEyeWebsiteLeadSummaryResponse;

export const getPixelEyeWebsiteLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadResponse> =>
  (await _axios(
    'get',
    `/pixeleye/website-leads/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PixelEyeWebsiteLeadResponse;

export const createPixelEyeWebsiteLead = async (
  payload: CreatePixelEyeWebsiteLeadPayload,
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadResponse> =>
  (await _axios(
    'post',
    '/pixeleye/website-leads',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PixelEyeWebsiteLeadResponse;

export const updatePixelEyeWebsiteLead = async (
  id: number,
  payload: UpdatePixelEyeWebsiteLeadPayload,
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadResponse> =>
  (await _axios(
    'patch',
    `/pixeleye/website-leads/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PixelEyeWebsiteLeadResponse;

export const deletePixelEyeWebsiteLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<PixelEyeWebsiteLeadDeleteResponse> =>
  (await _axios(
    'delete',
    `/pixeleye/website-leads/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PixelEyeWebsiteLeadDeleteResponse;
