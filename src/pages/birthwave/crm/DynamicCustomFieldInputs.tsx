import {
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { CrmCustomField, CrmCustomFieldValues } from 'services/crm';

interface DynamicCustomFieldInputsProps {
  fields: CrmCustomField[];
  values: CrmCustomFieldValues;
  onChange: (fieldKey: string, value: unknown) => void;
  errors?: Record<string, string>;
}

const ctrl = { '& .MuiInputBase-root': { height: 44 } };

const DynamicCustomFieldInputs = ({ fields, values, onChange, errors = {} }: DynamicCustomFieldInputsProps) => {
  if (fields.length === 0) return null;

  return (
    <Stack direction="column" spacing={2.25}>
      {fields.map((field) => {
        const value = values[field.field_key];
        const error = errors[field.field_key];

        switch (field.field_type) {
          case 'boolean':
            return (
              <FormControlLabel
                key={field.id}
                control={
                  <Checkbox
                    checked={Boolean(value)}
                    onChange={(e) => onChange(field.field_key, e.target.checked)}
                  />
                }
                label={`${field.label}${field.required ? ' *' : ''}`}
              />
            );

          case 'single_select':
            return (
              <FormControl fullWidth key={field.id} sx={ctrl} error={Boolean(error)}>
                <InputLabel id={`crm-field-${field.id}`}>{field.label}{field.required ? ' *' : ''}</InputLabel>
                <Select
                  labelId={`crm-field-${field.id}`}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  value={(value as string) ?? ''}
                  onChange={(e) => onChange(field.field_key, e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(field.options ?? []).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error}</FormHelperText>}
              </FormControl>
            );

          case 'multi_select':
            return (
              <FormControl fullWidth key={field.id} sx={ctrl} error={Boolean(error)}>
                <InputLabel id={`crm-field-${field.id}`}>{field.label}{field.required ? ' *' : ''}</InputLabel>
                <Select
                  labelId={`crm-field-${field.id}`}
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  multiple
                  value={(value as string[]) ?? []}
                  onChange={(e) => onChange(field.field_key, e.target.value)}
                  renderValue={(selected) => (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {(selected as string[]).map((val) => (
                        <Chip key={val} label={field.options?.find((o) => o.value === val)?.label ?? val} size="small" />
                      ))}
                    </Stack>
                  )}
                >
                  {(field.options ?? []).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText>{error}</FormHelperText>}
              </FormControl>
            );

          case 'long_text':
            return (
              <TextField
                key={field.id}
                fullWidth
                multiline
                minRows={3}
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                error={Boolean(error)}
                helperText={error}
              />
            );

          case 'number':
            return (
              <TextField
                key={field.id}
                fullWidth
                type="number"
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={value ?? ''}
                onChange={(e) => onChange(field.field_key, e.target.value === '' ? '' : Number(e.target.value))}
                error={Boolean(error)}
                helperText={error}
                sx={ctrl}
              />
            );

          case 'date':
            return (
              <TextField
                key={field.id}
                fullWidth
                type="date"
                label={`${field.label}${field.required ? ' *' : ''}`}
                InputLabelProps={{ shrink: true }}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                error={Boolean(error)}
                helperText={error}
                sx={ctrl}
              />
            );

          case 'datetime':
            return (
              <TextField
                key={field.id}
                fullWidth
                type="datetime-local"
                label={`${field.label}${field.required ? ' *' : ''}`}
                InputLabelProps={{ shrink: true }}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                error={Boolean(error)}
                helperText={error}
                sx={ctrl}
              />
            );

          default: {
            const inputType = field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'url' ? 'url' : 'text';
            return (
              <TextField
                key={field.id}
                fullWidth
                type={inputType}
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.field_key, e.target.value)}
                error={Boolean(error)}
                helperText={error}
                sx={ctrl}
              />
            );
          }
        }
      })}
    </Stack>
  );
};

export default DynamicCustomFieldInputs;
