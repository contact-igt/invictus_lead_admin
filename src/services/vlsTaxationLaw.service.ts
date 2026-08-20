import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsTaxationLawPayload,
  UpdateVlsTaxationLawPayload,
  VlsTaxationLawDeleteResponse,
  VlsTaxationLawExportFormat,
  VlsTaxationLawExportParams,
  VlsTaxationLawListParams,
  VlsTaxationLawListResponse,
  VlsTaxationLawResponse,
  VlsTaxationLawSummaryResponse,
} from 'types/vlsTaxationLaw';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsTaxationLawListParams): QueryParams => {
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

export const getVlsTaxationLawRegistrations = async (
  params: VlsTaxationLawListParams,
  superAdminClientKey?: string,
): Promise<VlsTaxationLawListResponse> =>
  (await _axios(
    'get',
    '/vls-taxation-law',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsTaxationLawListResponse;

export const getVlsTaxationLawSummary = async (
  params: VlsTaxationLawExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsTaxationLawSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-taxation-law/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsTaxationLawSummaryResponse;

export const exportVlsTaxationLawRegistrations = async (
  format: VlsTaxationLawExportFormat,
  params: VlsTaxationLawExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-taxation-law/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsTaxationLawRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsTaxationLawResponse> =>
  (await _axios(
    'get',
    `/vls-taxation-law/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsTaxationLawResponse;

export const createVlsTaxationLawRegistration = async (
  payload: CreateVlsTaxationLawPayload,
  superAdminClientKey?: string,
): Promise<VlsTaxationLawResponse> =>
  (await _axios(
    'post',
    '/vls-taxation-law',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsTaxationLawResponse;

export const updateVlsTaxationLawRegistration = async (
  id: number,
  payload: UpdateVlsTaxationLawPayload,
  superAdminClientKey?: string,
): Promise<VlsTaxationLawResponse> =>
  (await _axios(
    'patch',
    `/vls-taxation-law/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsTaxationLawResponse;

export const deleteVlsTaxationLawRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsTaxationLawDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-taxation-law/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsTaxationLawDeleteResponse;
