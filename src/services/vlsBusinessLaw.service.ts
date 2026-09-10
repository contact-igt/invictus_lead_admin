import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsBusinessLawPayload,
  UpdateVlsBusinessLawPayload,
  VlsBusinessLawDeleteResponse,
  VlsBusinessLawExportFormat,
  VlsBusinessLawExportParams,
  VlsBusinessLawListParams,
  VlsBusinessLawListResponse,
  VlsBusinessLawResponse,
  VlsBusinessLawSummaryResponse,
} from 'types/vlsBusinessLaw';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsBusinessLawListParams): QueryParams => {
  const cleaned: QueryParams = {};
  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.payment_status?.trim()) cleaned.payment_status = params.payment_status.trim();
  if (params.captured !== undefined && params.captured !== '') cleaned.captured = params.captured;
  if (params.page_name?.trim()) cleaned.page_name = params.page_name.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.registered_start_date) cleaned.registered_start_date = params.registered_start_date;
  if (params.registered_end_date) cleaned.registered_end_date = params.registered_end_date;
  if (params.programm_start_date) cleaned.programm_start_date = params.programm_start_date;
  if (params.programm_end_date) cleaned.programm_end_date = params.programm_end_date;
  return cleaned;
};

const withClientContext = (params: QueryParams, superAdminClientKey?: string): QueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getVlsBusinessLawRegistrations = async (
  params: VlsBusinessLawListParams,
  superAdminClientKey?: string,
): Promise<VlsBusinessLawListResponse> =>
  (await _axios(
    'get',
    '/vls-business-law',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsBusinessLawListResponse;

export const getVlsBusinessLawSummary = async (
  params: VlsBusinessLawExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsBusinessLawSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-business-law/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsBusinessLawSummaryResponse;

export const exportVlsBusinessLawRegistrations = async (
  format: VlsBusinessLawExportFormat,
  params: VlsBusinessLawExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-business-law/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsBusinessLawRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsBusinessLawResponse> =>
  (await _axios(
    'get',
    `/vls-business-law/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsBusinessLawResponse;

export const createVlsBusinessLawRegistration = async (
  payload: CreateVlsBusinessLawPayload,
  superAdminClientKey?: string,
): Promise<VlsBusinessLawResponse> =>
  (await _axios(
    'post',
    '/vls-business-law',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsBusinessLawResponse;

export const updateVlsBusinessLawRegistration = async (
  id: number,
  payload: UpdateVlsBusinessLawPayload,
  superAdminClientKey?: string,
): Promise<VlsBusinessLawResponse> =>
  (await _axios(
    'patch',
    `/vls-business-law/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsBusinessLawResponse;

export const deleteVlsBusinessLawRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsBusinessLawDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-business-law/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsBusinessLawDeleteResponse;
