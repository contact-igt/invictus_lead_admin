import { _axios } from 'helper/axios';
import type { NamokarWebsiteLeadListResponse } from 'types/namokarWebsiteLead';

export const getNamokarWebsiteLeads = (clientKey?: string) =>
  _axios(
    'get',
    '/namokar/website-leads',
    undefined,
    'application/json',
    clientKey ? { _client_key: clientKey } : undefined,
  ) as Promise<NamokarWebsiteLeadListResponse>;

export const retryNamokarWebsiteLeadDelivery = (id: number, clientKey?: string) =>
  _axios(
    'post',
    `/namokar/website-leads/${id}/retry-delivery`,
    undefined,
    'application/json',
    clientKey ? { _client_key: clientKey } : undefined,
  );
