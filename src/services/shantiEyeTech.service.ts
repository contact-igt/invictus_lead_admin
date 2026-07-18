import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  ShantiEyeTechDeleteResponse,
  ShantiEyeTechExportFormat,
  ShantiEyeTechExportParams,
  ShantiEyeTechLeadResponse,
  ShantiEyeTechListParams,
  ShantiEyeTechListResponse,
  ShantiEyeTechSummaryResponse,
  CreateShantiEyeTechLeadPayload,
  UpdateShantiEyeTechLeadPayload,
} from 'types/shantiEyeTech';

type ShantiEyeTechQueryParams = Record<string, string | number>;

const cleanListParams = (params: ShantiEyeTechListParams): ShantiEyeTechQueryParams => {
  const cleaned: ShantiEyeTechQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: ShantiEyeTechExportParams): ShantiEyeTechQueryParams => {
  const cleaned: ShantiEyeTechQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: ShantiEyeTechQueryParams,
  superAdminClientKey?: string,
): ShantiEyeTechQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getShantiEyeTechLeads = async (
  params: ShantiEyeTechListParams,
  superAdminClientKey?: string,
): Promise<ShantiEyeTechListResponse> =>
  (await _axios(
    'get',
    '/shanti-eye-tech',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as ShantiEyeTechListResponse;

export const exportShantiEyeTechLeads = async (
  format: ShantiEyeTechExportFormat,
  params: ShantiEyeTechExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/shanti-eye-tech/export',
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

export const getShantiEyeTechSummary = async (
  params: ShantiEyeTechExportParams = {},
  superAdminClientKey?: string,
): Promise<ShantiEyeTechSummaryResponse> =>
  (await _axios(
    'get',
    '/shanti-eye-tech/summary',
    undefined,
    'application/json',
    withClientContext(cleanExportParams(params), superAdminClientKey),
  )) as ShantiEyeTechSummaryResponse;

export const getShantiEyeTechLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<ShantiEyeTechLeadResponse> =>
  (await _axios(
    'get',
    `/shanti-eye-tech/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as ShantiEyeTechLeadResponse;

export const createShantiEyeTechLead = async (
  payload: CreateShantiEyeTechLeadPayload,
  superAdminClientKey?: string,
): Promise<ShantiEyeTechLeadResponse> =>
  (await _axios(
    'post',
    '/shanti-eye-tech',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as ShantiEyeTechLeadResponse;

export const updateShantiEyeTechLead = async (
  id: number,
  payload: UpdateShantiEyeTechLeadPayload,
  superAdminClientKey?: string,
): Promise<ShantiEyeTechLeadResponse> =>
  (await _axios(
    'patch',
    `/shanti-eye-tech/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as ShantiEyeTechLeadResponse;

export const deleteShantiEyeTechLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<ShantiEyeTechDeleteResponse> =>
  (await _axios(
    'delete',
    `/shanti-eye-tech/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as ShantiEyeTechDeleteResponse;

