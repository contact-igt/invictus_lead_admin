import { useFormik } from 'formik';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  ShantiEyeTechFormValues,
  shantiEyeTechInitialValues,
  shantiEyeTechSchema,
} from 'schemas/shantiEyeTechSchema';
import type { ShantiEyeTechLead } from 'types/shantiEyeTech';
import { SHANTI_EYE_TECH_SERVICES, formatShantiEyeTechDateTime } from './shantiEyeTechUtils';

export type ShantiEyeTechDrawerMode = 'create' | 'edit' | 'view';

interface ShantiEyeTechFormDrawerProps {
  open: boolean;
  mode: ShantiEyeTechDrawerMode;
  lead: ShantiEyeTechLead | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: ShantiEyeTechFormValues) => void;
}

const ShantiEyeTechFormDrawer = ({
  open,
  mode,
  lead,
  isLoading,
  onClose,
  onSubmit,
}: ShantiEyeTechFormDrawerProps) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const formik = useFormik<ShantiEyeTechFormValues>({
    initialValues: lead
      ? {
          name: lead.name ?? '',
          mobile_number: lead.mobile_number ?? '',
          service: lead.service ?? '',
          message: lead.message ?? '',
          ip_address: lead.ip_address ?? '',
          utm_source: lead.utm_source ?? '',
        }
      : shantiEyeTechInitialValues,
    validationSchema: shantiEyeTechSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const closeDrawer = () => {
    if (isLoading) return;
    formik.resetForm();
    onClose();
  };

  const field = (
    name: keyof ShantiEyeTechFormValues,
    label: string,
    required = false,
    fullWidth = false,
  ) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
      {name === 'service' ? (
        <TextField
          select
          fullWidth
          id={name}
          name={name}
          label={label}
          value={formik.values[name] ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched[name] && Boolean(formik.errors[name])}
          helperText={formik.touched[name] ? formik.errors[name] : undefined}
          disabled={isLoading}
          sx={{ minWidth: 0 }}
        >
          <MenuItem value="">
            <em>Choose a service</em>
          </MenuItem>
          {SHANTI_EYE_TECH_SERVICES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          fullWidth
          required={required}
          id={name}
          name={name}
          label={label}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched[name] && Boolean(formik.errors[name])}
          helperText={formik.touched[name] ? formik.errors[name] : undefined}
          disabled={isLoading}
          inputProps={{ maxLength: name === 'mobile_number' ? 20 : undefined }}
        />
      )}
    </Grid>
  );

  const viewItem = (label: string, value?: string | null, monospace = false) => (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        mt={0.5}
        sx={{ fontFamily: monospace ? 'monospace' : 'inherit', overflowWrap: 'anywhere' }}
      >
        {value || '-'}
      </Typography>
    </Box>
  );

  const title = isView
    ? 'Shanti Eye Tech Lead'
    : isEdit
      ? 'Edit Shanti Eye Tech Lead'
      : 'Add Shanti Eye Tech Lead';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 580 },
          maxWidth: '100vw',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box
        component={isView ? 'div' : 'form'}
        onSubmit={isView ? undefined : formik.handleSubmit}
        noValidate={!isView}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={750}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {isView
                  ? 'Read-only enquiry details'
                  : isEdit
                    ? 'Update the lead information below'
                    : 'Add a website enquiry or service lead'}
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer} disabled={isLoading} aria-label="Close drawer">
              <IconifyIcon icon="mdi:close" width={22} />
            </IconButton>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
          {isView ? (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {viewItem('Name', lead?.name)}
                {viewItem('Mobile Number', lead?.mobile_number)}
                {viewItem('Service', lead?.service)}
                {viewItem('Message', lead?.message)}
                {viewItem('IP Address', lead?.ip_address, true)}
                {viewItem('UTM Source', lead?.utm_source)}
              </Box>
              <Divider />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {viewItem('Created At', formatShantiEyeTechDateTime(lead?.created_at))}
                {viewItem('Updated At', formatShantiEyeTechDateTime(lead?.updated_at))}
              </Box>
            </Stack>
          ) : (
            <Grid container spacing={2.5}>
              {field('name', 'Name', true)}
              {field('mobile_number', 'Mobile Number', true)}
              {field('service', 'Service')}
              {field('message', 'Message', false, true)}
              {field('utm_source', 'UTM Source')}
              {field('ip_address', 'IP Address', false, true)}
            </Grid>
          )}
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={closeDrawer}
              disabled={isLoading}
            >
              {isView ? 'Close' : 'Cancel'}
            </Button>
            {!isView && (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !formik.isValid || !formik.dirty}
                startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : undefined}
              >
                {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ShantiEyeTechFormDrawer;

