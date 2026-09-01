import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  useArchiveCrmFieldMutation,
  useCreateCrmFieldMutation,
  useCrmFieldsQuery,
  useReorderCrmFieldsMutation,
  useUpdateCrmFieldMutation,
} from 'components/hooks/useCrmQuery';
import { CrmCustomField, CrmFieldOption, CrmFieldType } from 'services/crm';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const GREEN = '#29AF81';

const ENTITY_TYPE = 'birthwave_lead';

const FIELD_TYPE_LABELS: Record<CrmFieldType, string> = {
  text: 'Text',
  long_text: 'Long text',
  number: 'Number',
  date: 'Date',
  datetime: 'Date & time',
  single_select: 'Single select',
  multi_select: 'Multi select',
  boolean: 'Yes/No',
  email: 'Email',
  phone: 'Phone',
  url: 'URL',
};

const OPTIONS_TYPES: CrmFieldType[] = ['single_select', 'multi_select'];

interface FieldFormState {
  label: string;
  field_type: CrmFieldType;
  options: CrmFieldOption[];
  required: boolean;
  show_in_form: boolean;
  show_in_detail: boolean;
  show_in_table: boolean;
  filterable: boolean;
}

const emptyFormState: FieldFormState = {
  label: '',
  field_type: 'text',
  options: [],
  required: false,
  show_in_form: true,
  show_in_detail: true,
  show_in_table: false,
  filterable: false,
};

interface CustomFieldsManagerProps {
  clientKey: string | undefined;
}

const CustomFieldsManager = ({ clientKey }: CustomFieldsManagerProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CrmCustomField | null>(null);
  const [form, setForm] = useState<FieldFormState>(emptyFormState);
  const [optionDraft, setOptionDraft] = useState('');

  const { data: fields = [], isLoading } = useCrmFieldsQuery(clientKey, ENTITY_TYPE, { includeArchived: showArchived });
  const { mutate: createField, isLoading: isCreating } = useCreateCrmFieldMutation(clientKey);
  const { mutate: updateField, isLoading: isUpdating } = useUpdateCrmFieldMutation(clientKey);
  const { mutate: archiveField } = useArchiveCrmFieldMutation(clientKey);
  const { mutate: reorderFields } = useReorderCrmFieldsMutation(clientKey);

  const isSaving = isCreating || isUpdating;
  const activeFields = fields.filter((f) => f.active).sort((a, b) => a.display_order - b.display_order);
  const archivedFields = fields.filter((f) => !f.active);

  const openCreate = () => {
    setEditingField(null);
    setForm(emptyFormState);
    setDialogOpen(true);
  };

  const openEdit = (field: CrmCustomField) => {
    setEditingField(field);
    setForm({
      label: field.label,
      field_type: field.field_type,
      options: field.options ?? [],
      required: field.required,
      show_in_form: field.show_in_form,
      show_in_detail: field.show_in_detail,
      show_in_table: field.show_in_table,
      filterable: field.filterable,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setOptionDraft('');
  };

  const addOption = () => {
    const label = optionDraft.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!value || form.options.some((o) => o.value === value)) {
      setOptionDraft('');
      return;
    }
    setForm({ ...form, options: [...form.options, { value, label }] });
    setOptionDraft('');
  };

  const removeOption = (value: string) => {
    setForm({ ...form, options: form.options.filter((o) => o.value !== value) });
  };

  const handleSave = () => {
    const needsOptions = OPTIONS_TYPES.includes(form.field_type);
    if (needsOptions && form.options.length === 0) return;

    if (editingField) {
      updateField(
        {
          id: editingField.id,
          data: {
            label: form.label,
            options: needsOptions ? form.options : undefined,
            required: form.required,
            show_in_form: form.show_in_form,
            show_in_detail: form.show_in_detail,
            show_in_table: form.show_in_table,
            filterable: form.filterable,
          },
        },
        { onSuccess: closeDialog },
      );
    } else {
      createField(
        {
          entity_type: ENTITY_TYPE,
          label: form.label,
          field_type: form.field_type,
          options: needsOptions ? form.options : undefined,
          required: form.required,
          show_in_form: form.show_in_form,
          show_in_detail: form.show_in_detail,
          show_in_table: form.show_in_table,
          filterable: form.filterable,
        },
        { onSuccess: closeDialog },
      );
    }
  };

  const move = (field: CrmCustomField, direction: -1 | 1) => {
    const index = activeFields.findIndex((f) => f.id === field.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= activeFields.length) return;
    const ordered = [...activeFields];
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
    reorderFields(ordered.map((f) => f.id));
  };

  const visibilityChips = (field: CrmCustomField) => (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {field.required && <Chip label="Required" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#FEF2F2', color: '#EF4444', fontWeight: 700 }} />}
      {field.show_in_form && <Chip label="Form" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
      {field.show_in_detail && <Chip label="Detail" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
      {field.show_in_table && <Chip label="Table" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
      {field.filterable && <Chip label="Filterable" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(41,175,129,0.1)', color: GREEN, fontWeight: 700 }} />}
    </Stack>
  );

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} mb={2}>
        <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED }}>
          Fields you add here appear on Add Lead, Lead Detail, the Leads table, and filters — wherever you turn them on below.
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Icon icon="mdi:plus" width={16} height={16} />}
          onClick={openCreate}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', bgcolor: GREEN, boxShadow: 'none', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
        >
          Add Custom Field
        </Button>
      </Stack>

      {isLoading ? (
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>Loading fields...</Typography>
      ) : activeFields.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: CARD_BORDER, borderRadius: '10px' }}>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>No custom fields yet. Add one to extend the Leads form.</Typography>
        </Box>
      ) : (
        <Stack direction="column" spacing={1}>
          {activeFields.map((field, index) => (
            <Stack
              key={field.id}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ p: 1.5, border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px' }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                <Stack direction="column" spacing={0}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton size="small" disabled={index === 0} onClick={() => move(field, -1)} aria-label={`Move ${field.label} up`}>
                        <Icon icon="mdi:chevron-up" width={16} height={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton size="small" disabled={index === activeFields.length - 1} onClick={() => move(field, 1)} aria-label={`Move ${field.label} down`}>
                        <Icon icon="mdi:chevron-down" width={16} height={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{field.label}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>{FIELD_TYPE_LABELS[field.field_type]} · {field.field_key}</Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'row', sm: 'row' }} alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {visibilityChips(field)}
                <Button size="small" onClick={() => openEdit(field)} sx={{ textTransform: 'none', color: GREEN, fontWeight: 700, minWidth: 0 }}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => archiveField(field.id)} sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0 }}>
                  Archive
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}

      <Stack direction="row" alignItems="center" spacing={1} mt={2.5}>
        <FormControlLabel
          control={<Switch size="small" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
          label={<Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED }}>Show archived fields</Typography>}
        />
      </Stack>

      {showArchived && archivedFields.length > 0 && (
        <Stack direction="column" spacing={1} mt={1.5}>
          {archivedFields.map((field) => (
            <Stack key={field.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px', opacity: 0.6 }}>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{field.label}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>{FIELD_TYPE_LABELS[field.field_type]} · {field.field_key} · Archived</Typography>
              </Box>
              <Chip label="Archived" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
            </Stack>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>{editingField ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2.25} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              autoFocus
              label="Label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />

            <Select
              fullWidth
              value={form.field_type}
              onChange={(e) => setForm({ ...form, field_type: e.target.value as CrmFieldType, options: [] })}
              disabled={Boolean(editingField)}
            >
              {(Object.entries(FIELD_TYPE_LABELS) as [CrmFieldType, string][]).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
            {editingField && (
              <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, mt: -1.5 }}>Field type can&apos;t be changed after creation.</Typography>
            )}

            {OPTIONS_TYPES.includes(form.field_type) && (
              <Box>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Option label (e.g. Hot)"
                    value={optionDraft}
                    onChange={(e) => setOptionDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={addOption} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Add</Button>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {form.options.map((opt) => (
                    <Chip key={opt.value} label={opt.label} size="small" onDelete={() => removeOption(opt.value)} />
                  ))}
                </Stack>
              </Box>
            )}

            <FormControlLabel
              control={<Switch checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />}
              label="Required"
            />
            <FormControlLabel
              control={<Switch checked={form.show_in_form} onChange={(e) => setForm({ ...form, show_in_form: e.target.checked })} />}
              label="Show on Add/Edit Lead form"
            />
            <FormControlLabel
              control={<Switch checked={form.show_in_detail} onChange={(e) => setForm({ ...form, show_in_detail: e.target.checked })} />}
              label="Show on Lead Detail"
            />
            <FormControlLabel
              control={<Switch checked={form.show_in_table} onChange={(e) => setForm({ ...form, show_in_table: e.target.checked })} />}
              label="Show as a column in the Leads table"
            />
            <FormControlLabel
              control={<Switch checked={form.filterable} onChange={(e) => setForm({ ...form, filterable: e.target.checked })} />}
              label="Filterable on the Leads page"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            disabled={isSaving || !form.label.trim() || (OPTIONS_TYPES.includes(form.field_type) && form.options.length === 0)}
            onClick={handleSave}
            sx={{ bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
          >
            {isSaving ? 'Saving...' : editingField ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomFieldsManager;
