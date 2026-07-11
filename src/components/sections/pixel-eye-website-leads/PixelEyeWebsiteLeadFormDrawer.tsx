import { ChangeEvent, FocusEvent } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import useColorMode from 'hooks/useColorMode';
import IconifyIcon from 'components/base/IconifyIcon';
import PixelEyeField from 'components/sections/pixel-eye/PixelEyeField';
import { getPixelEyeFieldSx } from 'components/sections/pixel-eye/pixelEyeUi';
import { pixelEyeWebsiteLeadInitialValues, pixelEyeWebsiteLeadSchema } from 'schemas/pixelEyeWebsiteLeadSchema';
import { PIXEL_EYE_WEBSITE_LEAD_SERVICES } from './pixelEyeWebsiteLeadUtils';
import type { PixelEyeWebsiteLead } from 'types/pixelEyeWebsiteLead';

export type PixelEyeWebsiteLeadDrawerMode = 'create' | 'edit' | 'view';

interface PixelEyeWebsiteLeadFormDrawerProps {
  open: boolean;
  mode: PixelEyeWebsiteLeadDrawerMode;
  lead?: PixelEyeWebsiteLead | null;
  onSubmit: (values: {
    name: string;
    mobile_number: string;
    service: string;
    ip_address: string;
    utm_source: string;
  }) => void;
  onClose: () => void;
  isLoading: boolean;
  isReadOnly?: boolean;
}

const buildInitialValues = (lead?: PixelEyeWebsiteLead | null) => ({
  name: lead?.name ?? pixelEyeWebsiteLeadInitialValues.name,
  mobile_number: lead?.mobile_number ?? pixelEyeWebsiteLeadInitialValues.mobile_number,
  service: lead?.service ?? pixelEyeWebsiteLeadInitialValues.service,
  ip_address: lead?.ip_address ?? pixelEyeWebsiteLeadInitialValues.ip_address,
  utm_source: lead?.utm_source ?? pixelEyeWebsiteLeadInitialValues.utm_source,
});

const PixelEyeWebsiteLeadFormDrawer = ({
  open,
  mode,
  lead,
  onSubmit,
  onClose,
  isLoading,
  isReadOnly = false,
}: PixelEyeWebsiteLeadFormDrawerProps) => {
  const { mode: colorMode } = useColorMode();
  const isView = isReadOnly || mode === 'view';
  const fieldSx = getPixelEyeFieldSx(colorMode as 'dark' | 'light');

  const formik = useFormik({
    initialValues: buildInitialValues(lead),
    validationSchema: pixelEyeWebsiteLeadSchema,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  const handleTrimmedChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.target.value = event.target.value.trimStart();
    formik.handleChange(event);
  };

  const handleTrimBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value.trim());
    formik.handleBlur(event);
  };

  const title =
    mode === 'create'
      ? 'Add Website Lead'
      : mode === 'edit'
        ? 'Edit Website Lead'
        : 'Website Lead Details';

  const subtitle =
    mode === 'create'
      ? 'Capture a new PixelEye website enquiry.'
      : mode === 'edit'
        ? 'Update the lead details.'
        : 'Review the website enquiry in read-only mode.';

  const renderField = (
    name: keyof typeof formik.values,
    label: string,
    type: 'text' | 'tel' = 'text',
    helperText?: string,
    required = false,
  ) => {
    const isError = formik.touched[name] && Boolean(formik.errors[name]);

    return (
      <PixelEyeField
        fullWidth
        id={name}
        name={name}
        label={label}
        type={type}
        required={required}
        placeholder={isView ? undefined : 'Enter ' + label}
        value={formik.values[name]}
        onChange={handleTrimmedChange}
        onBlur={handleTrimBlur}
        error={isError}
        helperText={isError ? String(formik.errors[name] || '') : helperText}
        disabled={isView || isLoading}
        inputProps={type === 'tel' ? { inputMode: 'tel', maxLength: 20 } : undefined}
        sx={fieldSx}
      />
    );
  };

  const renderServiceField = () => {
    const isError = formik.touched.service && Boolean(formik.errors.service);

    return (
      <PixelEyeField
        select
        fullWidth
        id="service"
        name="service"
        label="Service"
        value={formik.values.service}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={isError}
        helperText={isError ? String(formik.errors.service || '') : undefined}
        disabled={isView || isLoading}
        sx={fieldSx}
        SelectProps={{ displayEmpty: true }}
      >
        <MenuItem value="">
          <em>Choose a service</em>
        </MenuItem>
        {PIXEL_EYE_WEBSITE_LEAD_SERVICES.map((service) => (
          <MenuItem key={service} value={service}>
            {service}
          </MenuItem>
        ))}
      </PixelEyeField>
    );
  };
  const sectionSx = {
    p: 2.5,
    borderRadius: 3,
    backgroundColor: colorMode === 'dark' ? '#13231d' : '#F8FAFC',
    border: '1px solid',
    borderColor: colorMode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : 'rgba(226, 232, 240, 0.8)',
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 560, md: 620 },
          maxWidth: '100%',
          background: colorMode === 'dark' ? '#0f1b16' : '#ffffff',
          color: colorMode === 'dark' ? '#f4fbf6' : '#0F172A',
          borderLeft: '1px solid ' + (colorMode === 'dark' ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'),
        },
      }}
      ModalProps={{ BackdropProps: { sx: { backgroundColor: 'rgba(2, 8, 6, 0.68)' } } }}
    >
      <Box
        component={isView ? 'div' : 'form'}
        onSubmit={isView ? undefined : formik.handleSubmit}
        noValidate={!isView}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: colorMode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : '#E2E8F0',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: colorMode === 'dark' ? '#9fb0a6' : '#64748B' }}>
              {subtitle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={isLoading} aria-label="Close drawer" sx={{ color: colorMode === 'dark' ? '#cfe2d5' : '#64748B' }}>
            <IconifyIcon icon="mdi:close" width={20} />
          </IconButton>
        </Stack>

        <Stack direction="column" spacing={2.5} sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, width: '100%' }}>
          <Box sx={sectionSx}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: colorMode === 'dark' ? '#dcebe2' : '#0F172A', fontWeight: 800 }}>
              Website Enquiry
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderField('name', 'Name', 'text', undefined, true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField('mobile_number', 'Mobile Number', 'tel', undefined, true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderServiceField()}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField('ip_address', 'IP Address')}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField('utm_source', 'UTM Source')}
              </Grid>
            </Grid>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            position: 'sticky',
            bottom: 0,
            px: 3,
            py: 2.25,
            backgroundColor: colorMode === 'dark' ? '#0f1b16' : '#ffffff',
            borderTop: '1px solid',
            borderColor: colorMode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : '#E2E8F0',
          }}
        >
          <Button onClick={onClose} color="inherit" disabled={isLoading} sx={{ color: colorMode === 'dark' ? '#cfe2d5' : '#64748B', textTransform: 'none' }}>
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView ? (
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !formik.isValid || !formik.dirty}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <IconifyIcon icon="mdi:content-save-outline" width={18} />}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                backgroundColor: colorMode === 'dark' ? '#1f6b40' : '#1F6B40',
                '&:hover': { backgroundColor: colorMode === 'dark' ? '#227a4b' : '#154f2e' },
              }}
            >
              {mode === 'create' ? 'Create Lead' : 'Save Changes'}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Drawer>
  );
};

export default PixelEyeWebsiteLeadFormDrawer;


