import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  CreateVlsConsumerProtectionLawMasterClassPayload,
  UpdateVlsConsumerProtectionLawMasterClassPayload,
  VlsConsumerProtectionLawMasterClassDeleteResponse,
  VlsConsumerProtectionLawMasterClassExportFormat,
  VlsConsumerProtectionLawMasterClassExportParams,
  VlsConsumerProtectionLawMasterClassListParams,
  VlsConsumerProtectionLawMasterClassListResponse,
  VlsConsumerProtectionLawMasterClassResponse,
  VlsConsumerProtectionLawMasterClassSummaryResponse,
} from 'types/vlsConsumerProtectionLawMasterClass';

type QueryParams = Record<string, string | number | boolean>;

const cleanListParams = (params: VlsConsumerProtectionLawMasterClassListParams): QueryParams => {
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

export const getVlsConsumerProtectionLawMasterClassRegistrations = async (
  params: VlsConsumerProtectionLawMasterClassListParams,
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassListResponse> =>
  (await _axios(
    'get',
    '/vls-consumer-protection-law-master-class',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassListResponse;

export const getVlsConsumerProtectionLawMasterClassSummary = async (
  params: VlsConsumerProtectionLawMasterClassExportParams = {},
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassSummaryResponse> =>
  (await _axios(
    'get',
    '/vls-consumer-protection-law-master-class/summary',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassSummaryResponse;

export const exportVlsConsumerProtectionLawMasterClassRegistrations = async (
  format: VlsConsumerProtectionLawMasterClassExportFormat,
  params: VlsConsumerProtectionLawMasterClassExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/vls-consumer-protection-law-master-class/export',
    undefined,
    'application/json',
    withClientContext({ format, ...cleanListParams(params) }, superAdminClientKey),
    { responseType: 'blob', returnRawResponse: true },
  )) as AxiosResponse<Blob>;

export const getVlsConsumerProtectionLawMasterClassRegistrationById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassResponse> =>
  (await _axios(
    'get',
    `/vls-consumer-protection-law-master-class/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassResponse;

export const createVlsConsumerProtectionLawMasterClassRegistration = async (
  payload: CreateVlsConsumerProtectionLawMasterClassPayload,
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassResponse> =>
  (await _axios(
    'post',
    '/vls-consumer-protection-law-master-class',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassResponse;

export const updateVlsConsumerProtectionLawMasterClassRegistration = async (
  id: number,
  payload: UpdateVlsConsumerProtectionLawMasterClassPayload,
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassResponse> =>
  (await _axios(
    'patch',
    `/vls-consumer-protection-law-master-class/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassResponse;

export const deleteVlsConsumerProtectionLawMasterClassRegistration = async (
  id: number,
  superAdminClientKey?: string,
): Promise<VlsConsumerProtectionLawMasterClassDeleteResponse> =>
  (await _axios(
    'delete',
    `/vls-consumer-protection-law-master-class/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as VlsConsumerProtectionLawMasterClassDeleteResponse;
