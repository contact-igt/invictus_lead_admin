import { CrmCustomField } from 'services/crm';

export const formatCrmFieldValue = (field: CrmCustomField, raw: unknown): string => {
  if (raw === null || raw === undefined || raw === '') return '—';
  if (field.field_type === 'boolean') return raw ? 'Yes' : 'No';
  if (field.field_type === 'single_select') {
    return field.options?.find((o) => o.value === raw)?.label ?? String(raw);
  }
  if (field.field_type === 'multi_select' && Array.isArray(raw)) {
    return raw.map((v) => field.options?.find((o) => o.value === v)?.label ?? v).join(', ') || '—';
  }
  if (field.field_type === 'date') {
    return new Date(String(raw)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (field.field_type === 'datetime') {
    return new Date(String(raw)).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return String(raw);
};
