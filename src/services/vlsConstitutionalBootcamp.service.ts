import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsConstitutionalBootcampPayload,
  UpdateVlsConstitutionalBootcampPayload,
  VlsConstitutionalBootcampDeleteResponse,
  VlsConstitutionalBootcampExportFormat,
  VlsConstitutionalBootcampExportParams,
  VlsConstitutionalBootcampListParams,
  VlsConstitutionalBootcampListResponse,
  VlsConstitutionalBootcampResponse,
  VlsConstitutionalBootcampSummaryResponse,
} from 'types/vlsConstitutionalBootcamp';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsConstitutionalBootcampListParams): QueryParams => {
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

export const getVlsConstitutionalBootcampRegistrations = async (
  params: VlsConstitutionalBootcampListParams,
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampListResponse> =>
  (await _axios(
    'get',
    '/vls-constitutional-bootcamp',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsConstitutionalBootcampListResponse;

export const getVlsConstitutionalBootcampSummary = async (
  params: VlsConstitutionalBootcampExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-constitutional-bootcamp/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsConstitutionalBootcampSummaryResponse;

export const exportVlsConstitutionalBootcampRegistrations = async (
  format: VlsConstitutionalBootcampExportFormat,
  params: VlsConstitutionalBootcampExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-constitutional-bootcamp/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsConstitutionalBootcampRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampResponse> =>
  (await _axios(
    'get',
    `/vls-constitutional-bootcamp/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConstitutionalBootcampResponse;

export const createVlsConstitutionalBootcampRegistration = async (
  payload: CreateVlsConstitutionalBootcampPayload,
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampResponse> =>
  (await _axios(
    'post',
    '/vls-constitutional-bootcamp',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConstitutionalBootcampResponse;

export const updateVlsConstitutionalBootcampRegistration = async (
  id: number,
  payload: UpdateVlsConstitutionalBootcampPayload,
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampResponse> =>
  (await _axios(
    'patch',
    `/vls-constitutional-bootcamp/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConstitutionalBootcampResponse;

export const deleteVlsConstitutionalBootcampRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsConstitutionalBootcampDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-constitutional-bootcamp/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConstitutionalBootcampDeleteResponse;
