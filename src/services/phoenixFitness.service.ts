import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  PhoenixFitnessDeleteResponse,
  PhoenixFitnessExportFormat,
  PhoenixFitnessExportParams,
  PhoenixFitnessLeadResponse,
  PhoenixFitnessListParams,
  PhoenixFitnessListResponse,
  PhoenixFitnessSummaryResponse,
  CreatePhoenixFitnessLeadPayload,
  UpdatePhoenixFitnessLeadPayload,
} from 'types/phoenixFitness';

type PhoenixFitnessQueryParams = Record<string, string | number>;

const cleanListParams = (params: PhoenixFitnessListParams): PhoenixFitnessQueryParams => {
  const cleaned: PhoenixFitnessQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.branch?.trim()) cleaned.branch = params.branch.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: PhoenixFitnessExportParams): PhoenixFitnessQueryParams => {
  const cleaned: PhoenixFitnessQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.branch?.trim()) cleaned.branch = params.branch.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: PhoenixFitnessQueryParams,
  superAdminClientKey?: string,
): PhoenixFitnessQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getPhoenixFitnessLeads = async (
  params: PhoenixFitnessListParams,
  superAdminClientKey?: string,
): Promise<PhoenixFitnessListResponse> =>
  (await _axios(
    'get',
    '/phoenix-fitness',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as PhoenixFitnessListResponse;

export const exportPhoenixFitnessLeads = async (
  format: PhoenixFitnessExportFormat,
  params: PhoenixFitnessExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/phoenix-fitness/export',
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

export const getPhoenixFitnessSummary = async (
  params: PhoenixFitnessExportParams = {},
  superAdminClientKey?: string,
): Promise<PhoenixFitnessSummaryResponse> =>
  (await _axios(
    'get',
    '/phoenix-fitness/summary',
    undefined,
    'application/json',
    withClientContext(cleanExportParams(params), superAdminClientKey),
  )) as PhoenixFitnessSummaryResponse;

export const getPhoenixFitnessLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<PhoenixFitnessLeadResponse> =>
  (await _axios(
    'get',
    `/phoenix-fitness/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PhoenixFitnessLeadResponse;

export const createPhoenixFitnessLead = async (
  payload: CreatePhoenixFitnessLeadPayload,
  superAdminClientKey?: string,
): Promise<PhoenixFitnessLeadResponse> =>
  (await _axios(
    'post',
    '/phoenix-fitness',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PhoenixFitnessLeadResponse;

export const updatePhoenixFitnessLead = async (
  id: number,
  payload: UpdatePhoenixFitnessLeadPayload,
  superAdminClientKey?: string,
): Promise<PhoenixFitnessLeadResponse> =>
  (await _axios(
    'patch',
    `/phoenix-fitness/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PhoenixFitnessLeadResponse;

export const deletePhoenixFitnessLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<PhoenixFitnessDeleteResponse> =>
  (await _axios(
    'delete',
    `/phoenix-fitness/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as PhoenixFitnessDeleteResponse;

