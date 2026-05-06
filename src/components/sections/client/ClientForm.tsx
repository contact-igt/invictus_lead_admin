import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ClientRecord } from 'components/hooks/useClientQuery';
import {
  buildClientKey,
  CLIENT_MODULE_OPTIONS,
  normalizeClientSegment,
  splitClientKeyForForm,
  SUPPORTED_CLIENT_MODULES,
  SupportedClientModule,
} from 'utils/clientKey';

interface ClientFormProps {
  initialValues?: ClientRecord | null;
  onSubmit: (values: { name: string; client_key?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  isReadOnly?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Client name is required'),
  module_key: Yup.string()
    .oneOf([...SUPPORTED_CLIENT_MODULES], 'Select a valid module')
    .required('Module is required'),
  tenant_key: Yup.string()
    .trim()
    .matches(/^[a-z0-9_]+$/, {
      message: 'Only lowercase letters, numbers and underscores are allowed',
      excludeEmptyString: true,
    })
    .optional(),
});

const ClientForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  isReadOnly = false,
}: ClientFormProps) => {
  const isEdit = Boolean(initialValues);
  const splitKey = splitClientKeyForForm(initialValues?.client_key);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name ?? '',
      module_key: (splitKey.moduleKey || 'pixeleye') as SupportedClientModule,
      tenant_key: normalizeClientSegment(splitKey.tenantKey),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload: { name: string; client_key?: string } = {
        name: values.name.trim(),
      };

      payload.client_key = buildClientKey(values.module_key, values.tenant_key);

      onSubmit(payload);
    },
  });

  const generatedClientKey = buildClientKey(formik.values.module_key, formik.values.tenant_key);

  const field = (
    name: 'name' | 'tenant_key',
    label: string,
    placeholder: string,
    required = false,
    helperExtra?: string,
  ) => {
    const isError = formik.touched[name] && Boolean(formik.errors[name]);
    return (
      <Box sx={{ width: 1 }}>
        <Typography variant="body2" fontWeight={600} mb={0.5}>
          {label}
          {required && (
            <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>
              *
            </Box>
          )}
        </Typography>
        <TextField
          fullWidth
          id={name}
          name={name}
          placeholder={placeholder}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={isError}
          helperText={isError ? formik.errors[name] : helperExtra}
          disabled={isReadOnly}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
      </Box>
    );
  };

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isReadOnly ? 'View Client' : isEdit ? 'Edit Client' : 'Add Client'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {isReadOnly
              ? 'Client details'
              : isEdit
                ? 'Update client information'
                : 'Register a new client in the system'}
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small">
          <IconifyIcon icon="mdi:close" width={22} height={22} />
        </IconButton>
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Stack direction="column" spacing={3} width={1} alignItems="stretch">
          {field('name', 'Client Name', 'e.g. Pixel Eye Hospital', true)}

          <Box sx={{ width: 1 }}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Module
              <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>
                *
              </Box>
            </Typography>
            <FormControl fullWidth error={formik.touched.module_key && Boolean(formik.errors.module_key)}>
              <InputLabel id="module-key-label">Select Module</InputLabel>
              <Select
                labelId="module-key-label"
                id="module_key"
                name="module_key"
                label="Select Module"
                value={formik.values.module_key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isReadOnly}
              >
                {CLIENT_MODULE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.module_key && formik.errors.module_key ? (
                <FormHelperText>{formik.errors.module_key}</FormHelperText>
              ) : (
                <FormHelperText>Decides which sidebar module this client can access</FormHelperText>
              )}
            </FormControl>
          </Box>

          {field(
            'tenant_key',
            'Client Code',
            'e.g. hyderabad, batch01, unit_2',
            false,
            'Optional suffix appended after module key',
          )}

          <TextField
            fullWidth
            label="Generated Client Key"
            value={generatedClientKey}
            InputProps={{ readOnly: true, sx: { borderRadius: 2 } }}
            helperText="This key is saved in backend and used for auth + sidebar mapping"
          />

          {isReadOnly && initialValues && (
            <Box sx={{ width: 1 }}>
              <Typography variant="body2" fontWeight={600} mb={0.5} color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {initialValues.created_at
                  ? new Date(initialValues.created_at).toLocaleString()
                  : '—'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isLoading}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.isValid || !formik.dirty}
              startIcon={
                isLoading ? <IconifyIcon icon="eos-icons:loading" /> : null
              }
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Client'}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default ClientForm;
