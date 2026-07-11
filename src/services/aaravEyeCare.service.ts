import type { AxiosResponse } from 'axios';
import { _axios } from 'helper/axios';
import type {
  AaravEyeCareDeleteResponse,
  AaravEyeCareExportFormat,
  AaravEyeCareExportParams,
  AaravEyeCareLeadResponse,
  AaravEyeCareListParams,
  AaravEyeCareListResponse,
  AaravEyeCareSummaryResponse,
  CreateAaravEyeCareLeadPayload,
  UpdateAaravEyeCareLeadPayload,
} from 'types/aaravEyeCare';

type AaravQueryParams = Record<string, string | number>;

const cleanListParams = (params: AaravEyeCareListParams): AaravQueryParams => {
  const cleaned: AaravQueryParams = {};

  if (params.page !== undefined) cleaned.page = params.page;
  if (params.limit !== undefined) cleaned.limit = params.limit;
  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const cleanExportParams = (params: AaravEyeCareExportParams): AaravQueryParams => {
  const cleaned: AaravQueryParams = {};

  if (params.search?.trim()) cleaned.search = params.search.trim();
  if (params.service?.trim()) cleaned.service = params.service.trim();
  if (params.utm_source?.trim()) cleaned.utm_source = params.utm_source.trim();
  if (params.start_date) cleaned.start_date = params.start_date;
  if (params.end_date) cleaned.end_date = params.end_date;

  return cleaned;
};

const withClientContext = (
  params: AaravQueryParams,
  superAdminClientKey?: string,
): AaravQueryParams => {
  if (!superAdminClientKey?.trim()) return params;
  return { ...params, _client_key: superAdminClientKey.trim() };
};

export const getAaravEyeCareLeads = async (
  params: AaravEyeCareListParams,
  superAdminClientKey?: string,
): Promise<AaravEyeCareListResponse> =>
  (await _axios(
    'get',
    '/aarav-eye-care',
    undefined,
    'application/json',
    withClientContext(cleanListParams(params), superAdminClientKey),
  )) as AaravEyeCareListResponse;

export const exportAaravEyeCareLeads = async (
  format: AaravEyeCareExportFormat,
  params: AaravEyeCareExportParams,
  superAdminClientKey?: string,
): Promise<AxiosResponse<Blob>> =>
  (await _axios(
    'get',
    '/aarav-eye-care/export',
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

export const getAaravEyeCareSummary = async (
  superAdminClientKey?: string,
): Promise<AaravEyeCareSummaryResponse> =>
  (await _axios(
    'get',
    '/aarav-eye-care/summary',
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AaravEyeCareSummaryResponse;

export const getAaravEyeCareLeadById = async (
  id: number,
  superAdminClientKey?: string,
): Promise<AaravEyeCareLeadResponse> =>
  (await _axios(
    'get',
    `/aarav-eye-care/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AaravEyeCareLeadResponse;

export const createAaravEyeCareLead = async (
  payload: CreateAaravEyeCareLeadPayload,
  superAdminClientKey?: string,
): Promise<AaravEyeCareLeadResponse> =>
  (await _axios(
    'post',
    '/aarav-eye-care',
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AaravEyeCareLeadResponse;

export const updateAaravEyeCareLead = async (
  id: number,
  payload: UpdateAaravEyeCareLeadPayload,
  superAdminClientKey?: string,
): Promise<AaravEyeCareLeadResponse> =>
  (await _axios(
    'patch',
    `/aarav-eye-care/${id}`,
    payload,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AaravEyeCareLeadResponse;

export const deleteAaravEyeCareLead = async (
  id: number,
  superAdminClientKey?: string,
): Promise<AaravEyeCareDeleteResponse> =>
  (await _axios(
    'delete',
    `/aarav-eye-care/${id}`,
    undefined,
    'application/json',
    withClientContext({}, superAdminClientKey),
  )) as AaravEyeCareDeleteResponse;
