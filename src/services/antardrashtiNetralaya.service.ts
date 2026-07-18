import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  AntardrashtiNetralayaDeleteResponse,
  AntardrashtiNetralayaExportFormat,
  AntardrashtiNetralayaExportParams,
  AntardrashtiNetralayaLeadResponse,
  AntardrashtiNetralayaListParams,
  AntardrashtiNetralayaListResponse,
  AntardrashtiNetralayaSummaryResponse,
  CreateAntardrashtiNetralayaLeadPayload,
  UpdateAntardrashtiNetralayaLeadPayload,
} from 'types/antardrashtiNetralaya';

type AntardrashtiQueryParams = Record<string, string | number>;

const cleanListParams = (params: AntardrashtiNetralayaListParams): AntardrashtiQueryParams => {
  const cleaned: AntardrashtiQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: AntardrashtiNetralayaExportParams): AntardrashtiQueryParams => {
  const cleaned: AntardrashtiQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: AntardrashtiQueryParams,
  superAdminClientKey?: string,
): AntardrashtiQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getAntardrashtiNetralayaLeads = async (
  params: AntardrashtiNetralayaListParams,
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaListResponse> =>
  (await _axios(
    'get',
    '/antardrashti-netralaya',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as AntardrashtiNetralayaListResponse;

export const exportAntardrashtiNetralayaLeads = async (
  format: AntardrashtiNetralayaExportFormat,
  params: AntardrashtiNetralayaExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/antardrashti-netralaya/export',
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

export const getAntardrashtiNetralayaSummary = async (
  params: AntardrashtiNetralayaExportParams = {},
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaSummaryResponse> =>
  (await _axios(
    'get',
    '/antardrashti-netralaya/summary',
    undefined,
    'application/json',
    withClientContext(cleanExportParams(params), superAdminClientKey),
  )) as AntardrashtiNetralayaSummaryResponse;

export const getAntardrashtiNetralayaLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaLeadResponse> =>
  (await _axios(
    'get',
    `/antardrashti-netralaya/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AntardrashtiNetralayaLeadResponse;

export const createAntardrashtiNetralayaLead = async (
  payload: CreateAntardrashtiNetralayaLeadPayload,
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaLeadResponse> =>
  (await _axios(
    'post',
    '/antardrashti-netralaya',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AntardrashtiNetralayaLeadResponse;

export const updateAntardrashtiNetralayaLead = async (
  id: number,
  payload: UpdateAntardrashtiNetralayaLeadPayload,
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaLeadResponse> =>
  (await _axios(
    'patch',
    `/antardrashti-netralaya/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AntardrashtiNetralayaLeadResponse;

export const deleteAntardrashtiNetralayaLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<AntardrashtiNetralayaDeleteResponse> =>
  (await _axios(
    'delete',
    `/antardrashti-netralaya/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AntardrashtiNetralayaDeleteResponse;

