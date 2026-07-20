import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
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
        // tenant_key trimmed via trimStart/trimBlur; buildClientKey normalizes it
      };

      payload.client_key = buildClientKey(values.module_key, values.tenant_key);

      onSubmit(payload);
    },
  });

  const handleTrimmedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.trimStart();
    formik.handleChange(e);
  };

  const handleTrimBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value.trim());
    formik.handleBlur(e);
  };

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
          size="small"
          id={name}
          name={name}
          placeholder={placeholder}
          value={formik.values[name]}
          onChange={handleTrimmedChange}
          onBlur={handleTrimBlur}
          error={isError}
          helperText={isError ? formik.errors[name] : helperExtra}
          disabled={isReadOnly}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: isReadOnly ? 'action.hover' : 'background.paper',
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
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
        <IconButton onClick={onCancel} size="small" aria-label="Close client drawer">
          <IconifyIcon icon="mdi:close" width={22} height={22} />
        </IconButton>
      </Box>

      <Divider />

      {/* Body */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        <Stack direction="column" spacing={2.75} width={1} alignItems="stretch">
          {field('name', 'Client Name', 'e.g. Pixel Eye Hospital', true)}

          <Box sx={{ width: 1 }}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Module
              <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>
                *
              </Box>
            </Typography>
            <FormControl fullWidth size="small" error={formik.touched.module_key && Boolean(formik.errors.module_key)}>
              <Select
                id="module_key"
                name="module_key"
                value={formik.values.module_key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isReadOnly}
                inputProps={{ 'aria-label': 'Module' }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isReadOnly ? 'action.hover' : 'background.paper',
                }}
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

          <Box
            sx={{
              width: 1,
              p: 1.75,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'action.selected',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              GENERATED CLIENT KEY
            </Typography>
            <Box
              component="code"
              sx={{
                display: 'block',
                mt: 0.75,
                px: 1.25,
                py: 1,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                fontWeight: 700,
                overflowX: 'auto',
              }}
            >
              {generatedClientKey}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
              Automatically used for access and sidebar mapping.
            </Typography>
          </Box>

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
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 3 },
          py: 2.25,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isLoading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
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
              sx={{
                width: { xs: '100%', sm: 'auto' },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled',
                },
              }}
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
