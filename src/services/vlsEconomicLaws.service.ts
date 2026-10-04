import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsEconomicLawsPayload,
  UpdateVlsEconomicLawsPayload,
  VlsEconomicLawsDeleteResponse,
  VlsEconomicLawsExportFormat,
  VlsEconomicLawsExportParams,
  VlsEconomicLawsListParams,
  VlsEconomicLawsListResponse,
  VlsEconomicLawsResponse,
  VlsEconomicLawsSummaryResponse,
} from 'types/vlsEconomicLaws';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsEconomicLawsListParams): QueryParams => {
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

export const getVlsEconomicLawsRegistrations = async (
  params: VlsEconomicLawsListParams,
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsListResponse> =>
  (await _axios(
    'get',
    '/vls-economic-laws',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsEconomicLawsListResponse;

export const getVlsEconomicLawsSummary = async (
  params: VlsEconomicLawsExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-economic-laws/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsEconomicLawsSummaryResponse;

export const exportVlsEconomicLawsRegistrations = async (
  format: VlsEconomicLawsExportFormat,
  params: VlsEconomicLawsExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-economic-laws/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsEconomicLawsRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsResponse> =>
  (await _axios(
    'get',
    `/vls-economic-laws/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsEconomicLawsResponse;

export const createVlsEconomicLawsRegistration = async (
  payload: CreateVlsEconomicLawsPayload,
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsResponse> =>
  (await _axios(
    'post',
    '/vls-economic-laws',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsEconomicLawsResponse;

export const updateVlsEconomicLawsRegistration = async (
  id: number,
  payload: UpdateVlsEconomicLawsPayload,
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsResponse> =>
  (await _axios(
    'patch',
    `/vls-economic-laws/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsEconomicLawsResponse;

export const deleteVlsEconomicLawsRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsEconomicLawsDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-economic-laws/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsEconomicLawsDeleteResponse;
