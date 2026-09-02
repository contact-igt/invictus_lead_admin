import { useEffect, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useCrmFieldsQuery, useCrmMappingsQuery, useSaveCrmMappingsMutation } from 'components/hooks/useCrmQuery';
import { CrmProvider } from 'services/crm';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const PROVIDERS: { value: CrmProvider; label: string }[] = [
  { value: 'runo', label: 'Runo' },
  { value: 'meta', label: 'Meta' },
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp / WhatsNexus' },
];

const STANDARD_TARGETS = [
  { value: 'name', label: 'Name' },
  { value: 'phone', label: 'Mobile' },
  { value: 'email', label: 'Email' },
  { value: 'service', label: 'Service' },
  { value: 'source', label: 'Source' },
  { value: 'notes', label: 'Notes' },
];

interface MappingRow {
  external_field: string;
  target_type: 'standard' | 'custom';
  target_field: string;
}

interface FieldMappingPanelProps {
  clientKey: string | undefined;
}

const FieldMappingPanel = ({ clientKey }: FieldMappingPanelProps) => {
  const [provider, setProvider] = useState<CrmProvider>('meta');
  const [rows, setRows] = useState<MappingRow[]>([]);

  const { data: savedMappings = [] } = useCrmMappingsQuery(clientKey, provider);
  const { data: customFields = [] } = useCrmFieldsQuery(clientKey, 'birthwave_lead');
  const { mutate: saveMappings, isLoading: isSaving } = useSaveCrmMappingsMutation(clientKey);

  useEffect(() => {
    setRows(savedMappings.map((m) => ({ external_field: m.external_field, target_type: m.target_type, target_field: m.target_field })));
  }, [savedMappings]);

  const targetOptions = [
    ...STANDARD_TARGETS.map((t) => ({ ...t, target_type: 'standard' as const })),
    ...customFields.map((f) => ({ value: f.field_key, label: f.label, target_type: 'custom' as const })),
  ];

  const addRow = () => setRows([...rows, { external_field: '', target_type: 'standard', target_field: 'name' }]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
  const updateRow = (index: number, patch: Partial<MappingRow>) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleSave = () => {
    const validRows = rows.filter((r) => r.external_field.trim() && r.target_field);
    saveMappings({ provider, mappings: validRows });
  };

  return (
    <Box>
      <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mb: 2 }}>
        Map each provider&apos;s payload field onto a standard or custom lead field. Used by the ingestion pipeline to turn incoming leads into Birthwave leads.
      </Typography>

      <Select size="small" value={provider} onChange={(e) => setProvider(e.target.value as CrmProvider)} sx={{ minWidth: 200, mb: 2 }}>
        {PROVIDERS.map((p) => (
          <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
        ))}
      </Select>

      <Stack direction="column" spacing={1.25}>
        {rows.map((row, index) => (
          <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              size="small"
              placeholder="External field (e.g. full_name)"
              value={row.external_field}
              onChange={(e) => updateRow(index, { external_field: e.target.value })}
              sx={{ minWidth: 0, flex: 1 }}
            />
            <Icon icon="mdi:arrow-right" width={16} height={16} color={TEXT_MUTED} style={{ flexShrink: 0 }} />
            <Select
              size="small"
              value={`${row.target_type}:${row.target_field}`}
              onChange={(e) => {
                const [targetType, ...rest] = String(e.target.value).split(':');
                updateRow(index, { target_type: targetType as 'standard' | 'custom', target_field: rest.join(':') });
              }}
              sx={{ minWidth: 0, flex: 1 }}
            >
              {targetOptions.map((opt) => (
                <MenuItem key={`${opt.target_type}:${opt.value}`} value={`${opt.target_type}:${opt.value}`}>
                  {opt.label}{opt.target_type === 'custom' ? ' (custom)' : ''}
                </MenuItem>
              ))}
            </Select>
            <IconButton size="small" onClick={() => removeRow(index)} aria-label="Remove mapping row" sx={{ flexShrink: 0 }}>
              <Icon icon="mdi:trash-can-outline" width={18} height={18} />
            </IconButton>
          </Stack>
        ))}

        {rows.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: CARD_BORDER, borderRadius: '10px' }}>
            <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>No field mapping yet for {PROVIDERS.find((p) => p.value === provider)?.label}.</Typography>
          </Box>
        )}
      </Stack>

      <Stack direction="row" spacing={1.5} mt={2}>
        <Button size="small" startIcon={<Icon icon="mdi:plus" width={16} height={16} />} onClick={addRow} sx={{ textTransform: 'none' }}>
          Add Row
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={isSaving}
          onClick={handleSave}
          sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
        >
          {isSaving ? 'Saving...' : 'Save Mapping'}
        </Button>
      </Stack>
    </Box>
  );
};

export default FieldMappingPanel;
