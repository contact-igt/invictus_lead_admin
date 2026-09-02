import { _axios } from 'helper/axios';

const withClientKey = (params: Record<string, unknown> = {}, clientKey?: string) =>
  clientKey ? { ...params, _client_key: clientKey } : params;

export type CrmFieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'single_select'
  | 'multi_select'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'url';

export interface CrmFieldOption {
  value: string;
  label: string;
}

export interface CrmCustomField {
  id: number;
  client_id: number;
  entity_type: string;
  field_key: string;
  label: string;
  field_type: CrmFieldType;
  options: CrmFieldOption[] | null;
  required: boolean;
  active: boolean;
  show_in_form: boolean;
  show_in_detail: boolean;
  show_in_table: boolean;
  filterable: boolean;
  display_order: number;
}

export type CrmCustomFieldValues = Record<string, string | number | boolean | string[] | null>;

export type CrmProvider = 'runo' | 'meta' | 'website' | 'whatsapp';
export type CrmIntegrationStatus = 'not_configured' | 'connected' | 'error';

export interface CrmIntegration {
  provider: CrmProvider;
  enabled: boolean;
  status: CrmIntegrationStatus;
  last_error: string | null;
  last_event_at: string | null;
  config: Record<string, string>;
  config_keys_set: string[];
}

export interface CrmFieldMapping {
  id: number;
  provider: CrmProvider;
  external_field: string;
  target_type: 'standard' | 'custom';
  target_field: string;
}

export interface CrmCall {
  id: number;
  client_id: number;
  lead_id: number | null;
  provider: string;
  external_call_id: string;
  phone_number: string | null;
  normalized_phone_number: string | null;
  direction: 'inbound' | 'outbound' | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  agent_name: string | null;
  recording_url: string | null;
  outcome: string | null;
  lead?: { id: number; name: string; phone: string } | null;
}

export const CrmApis = {
  getFields: (clientKey: string | undefined, entityType: string, includeArchived = false) =>
    _axios(
      'get',
      '/crm/fields',
      undefined,
      undefined,
      withClientKey({ entity_type: entityType, include_archived: includeArchived ? 'true' : undefined }, clientKey),
    ),
  createField: (clientKey: string | undefined, data: Partial<CrmCustomField>) =>
    _axios('post', '/crm/fields', data, undefined, withClientKey({}, clientKey)),
  updateField: (clientKey: string | undefined, id: number, data: Partial<CrmCustomField>) =>
    _axios('patch', `/crm/fields/${id}`, data, undefined, withClientKey({}, clientKey)),
  archiveField: (clientKey: string | undefined, id: number) =>
    _axios('post', `/crm/fields/${id}/archive`, undefined, undefined, withClientKey({}, clientKey)),
  reorderFields: (clientKey: string | undefined, orderedIds: number[]) =>
    _axios('post', '/crm/fields/reorder', { ordered_ids: orderedIds }, undefined, withClientKey({}, clientKey)),

  getCalls: (clientKey: string | undefined, params: Record<string, unknown> = {}) =>
    _axios('get', '/crm/calls', undefined, undefined, withClientKey(params, clientKey)),
  ingestDemoCall: (clientKey: string | undefined, provider: string, data: Record<string, unknown>) =>
    _axios('post', `/crm/calls/ingest/${provider}`, data, undefined, withClientKey({}, clientKey)),

  getIntegrations: (clientKey: string | undefined) =>
    _axios('get', '/crm/integrations', undefined, undefined, withClientKey({}, clientKey)),
  updateIntegration: (clientKey: string | undefined, provider: CrmProvider, data: { enabled?: boolean; config?: Record<string, string> }) =>
    _axios('patch', `/crm/integrations/${provider}`, data, undefined, withClientKey({}, clientKey)),

  getMappings: (clientKey: string | undefined, provider: CrmProvider) =>
    _axios('get', '/crm/mappings', undefined, undefined, withClientKey({ provider }, clientKey)),
  saveMappings: (clientKey: string | undefined, provider: CrmProvider, mappings: Array<{ external_field: string; target_type: string; target_field: string }>) =>
    _axios('put', '/crm/mappings', { provider, mappings }, undefined, withClientKey({}, clientKey)),
};
