import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsMactMasterClassPayload,
  UpdateVlsMactMasterClassPayload,
  VlsMactMasterClassDeleteResponse,
  VlsMactMasterClassExportFormat,
  VlsMactMasterClassExportParams,
  VlsMactMasterClassListParams,
  VlsMactMasterClassListResponse,
  VlsMactMasterClassResponse,
  VlsMactMasterClassSummaryResponse,
} from 'types/vlsMactMasterClass';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsMactMasterClassListParams): QueryParams => {
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

export const getVlsMactMasterClassRegistrations = async (
  params: VlsMactMasterClassListParams,
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassListResponse> =>
  (await _axios(
    'get',
    '/vls-mact-master-class',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsMactMasterClassListResponse;

export const getVlsMactMasterClassSummary = async (
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-mact-master-class/summary',
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsMactMasterClassSummaryResponse;

export const exportVlsMactMasterClassRegistrations = async (
  format: VlsMactMasterClassExportFormat,
  params: VlsMactMasterClassExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-mact-master-class/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsMactMasterClassRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassResponse> =>
  (await _axios(
    'get',
    `/vls-mact-master-class/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsMactMasterClassResponse;

export const createVlsMactMasterClassRegistration = async (
  payload: CreateVlsMactMasterClassPayload,
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassResponse> =>
  (await _axios(
    'post',
    '/vls-mact-master-class',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsMactMasterClassResponse;

export const updateVlsMactMasterClassRegistration = async (
  id: number,
  payload: UpdateVlsMactMasterClassPayload,
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassResponse> =>
  (await _axios(
    'patch',
    `/vls-mact-master-class/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsMactMasterClassResponse;

export const deleteVlsMactMasterClassRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsMactMasterClassDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-mact-master-class/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsMactMasterClassDeleteResponse;
