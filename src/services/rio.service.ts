import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  RioDeleteResponse,
  RioExportFormat,
  RioExportParams,
  RioLeadResponse,
  RioListParams,
  RioListResponse,
  RioSummaryResponse,
  CreateRioLeadPayload,
  UpdateRioLeadPayload,
} from 'types/rio';

type RioQueryParams = Record<string, string | number>;

const cleanListParams = (params: RioListParams): RioQueryParams => {
  const cleaned: RioQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: RioExportParams): RioQueryParams => {
  const cleaned: RioQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: RioQueryParams,
  superAdminClientKey?: string,
): RioQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getRioLeads = async (
  params: RioListParams,
  superAdminClientKey?: string,
): Promise<RioListResponse> =>
  (await _axios(
    'get',
    '/rio',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as RioListResponse;

export const exportRioLeads = async (
  format: RioExportFormat,
  params: RioExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/rio/export',
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

export const getRioSummary = async (
  superAdminClientKey?: string,
): Promise<RioSummaryResponse> =>
  (await _axios(
    'get',
    '/rio/summary',
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as RioSummaryResponse;

export const getRioLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<RioLeadResponse> =>
  (await _axios(
    'get',
    `/rio/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as RioLeadResponse;

export const createRioLead = async (
  payload: CreateRioLeadPayload,
  superAdminClientKey?: string,
): Promise<RioLeadResponse> =>
  (await _axios(
    'post',
    '/rio',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as RioLeadResponse;

export const updateRioLead = async (
  id: number,
  payload: UpdateRioLeadPayload,
  superAdminClientKey?: string,
): Promise<RioLeadResponse> =>
  (await _axios(
    'patch',
    `/rio/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as RioLeadResponse;

export const deleteRioLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<RioDeleteResponse> =>
  (await _axios(
    'delete',
    `/rio/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as RioDeleteResponse;

