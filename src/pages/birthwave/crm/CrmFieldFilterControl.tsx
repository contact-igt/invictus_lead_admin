import { MenuItem, Select, Stack, TextField } from '@mui/material';
import { CrmCustomField } from 'services/crm';

interface CrmFieldFilterControlProps {
  fields: CrmCustomField[];
  fieldKey: string;
  value: string;
  onFieldKeyChange: (fieldKey: string) => void;
  onValueChange: (value: string) => void;
}

const ctrlSx = { minWidth: 0, width: { xs: '100%', sm: 170 } };

// One filterable custom field at a time — matches the backend's
// custom_field_key/custom_field_value query params (a single-value filter,
// not a multi-field query builder).
const CrmFieldFilterControl = ({ fields, fieldKey, value, onFieldKeyChange, onValueChange }: CrmFieldFilterControlProps) => {
  if (fields.length === 0) return null;

  const activeField = fields.find((f) => f.field_key === fieldKey);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
      <Select
        size="small"
        displayEmpty
        value={fieldKey}
        onChange={(e) => {
          onFieldKeyChange(e.target.value);
          onValueChange('');
        }}
        sx={ctrlSx}
      >
        <MenuItem value="">Custom field...</MenuItem>
        {fields.map((f) => (
          <MenuItem key={f.field_key} value={f.field_key}>{f.label}</MenuItem>
        ))}
      </Select>

      {activeField && activeField.field_type === 'single_select' ? (
        <Select size="small" displayEmpty value={value} onChange={(e) => onValueChange(e.target.value)} sx={ctrlSx}>
          <MenuItem value="">Any value</MenuItem>
          {(activeField.options ?? []).map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      ) : activeField && activeField.field_type === 'boolean' ? (
        <Select size="small" displayEmpty value={value} onChange={(e) => onValueChange(e.target.value)} sx={ctrlSx}>
          <MenuItem value="">Any value</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      ) : activeField ? (
        <TextField
          size="small"
          type={activeField.field_type === 'number' ? 'number' : activeField.field_type === 'date' ? 'date' : 'text'}
          placeholder={`${activeField.label} value`}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          sx={ctrlSx}
        />
      ) : null}
    </Stack>
  );
};

export default CrmFieldFilterControl;
