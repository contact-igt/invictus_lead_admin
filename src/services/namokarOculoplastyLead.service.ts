import { _axios } from 'helper/axios';

const params = (clientKey?: string) => (clientKey ? { _client_key: clientKey } : undefined);
export const getNamokarOculoplastyLeads = (query: Record<string, unknown>, clientKey?: string) =>
  _axios('get', '/namokar-oculoplasty/leads', undefined, 'application/json', { ...query, ...params(clientKey) });
export const updateNamokarOculoplastyLead = (id: number, data: { lead_status?: string; notes?: string }, clientKey?: string) =>
  _axios('patch', `/namokar-oculoplasty/leads/${id}`, data, 'application/json', params(clientKey));
export const retryNamokarOculoplastySheetSync = (id: number, clientKey?: string) =>
  _axios('post', `/namokar-oculoplasty/leads/${id}/retry-sheet-sync`, undefined, 'application/json', params(clientKey));
