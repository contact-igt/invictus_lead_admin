import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsLawPracticePayload,
  UpdateVlsLawPracticePayload,
  VlsLawPracticeDeleteResponse,
  VlsLawPracticeExportFormat,
  VlsLawPracticeExportParams,
  VlsLawPracticeListParams,
  VlsLawPracticeListResponse,
  VlsLawPracticeResponse,
  VlsLawPracticeSummaryResponse,
} from 'types/vlsLawPractice';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsLawPracticeListParams): QueryParams => {
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

export const getVlsLawPracticeRegistrations = async (
  params: VlsLawPracticeListParams,
  superAdminClientKey?: string,
): Promise<VlsLawPracticeListResponse> =>
  (await _axios(
    'get',
    '/vls-law-practice',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsLawPracticeListResponse;

export const getVlsLawPracticeSummary = async (
  params: VlsLawPracticeExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsLawPracticeSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-law-practice/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsLawPracticeSummaryResponse;

export const exportVlsLawPracticeRegistrations = async (
  format: VlsLawPracticeExportFormat,
  params: VlsLawPracticeExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-law-practice/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsLawPracticeRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsLawPracticeResponse> =>
  (await _axios(
    'get',
    `/vls-law-practice/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsLawPracticeResponse;

export const createVlsLawPracticeRegistration = async (
  payload: CreateVlsLawPracticePayload,
  superAdminClientKey?: string,
): Promise<VlsLawPracticeResponse> =>
  (await _axios(
    'post',
    '/vls-law-practice',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsLawPracticeResponse;

export const updateVlsLawPracticeRegistration = async (
  id: number,
  payload: UpdateVlsLawPracticePayload,
  superAdminClientKey?: string,
): Promise<VlsLawPracticeResponse> =>
  (await _axios(
    'patch',
    `/vls-law-practice/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsLawPracticeResponse;

export const deleteVlsLawPracticeRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsLawPracticeDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-law-practice/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsLawPracticeDeleteResponse;
