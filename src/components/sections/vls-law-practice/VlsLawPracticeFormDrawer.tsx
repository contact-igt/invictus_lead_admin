import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  VLS_LAW_PRACTICE_PAGE_NAME_OPTIONS,
  VlsLawPracticeFormValues,
  vlsLawPracticeInitialValues,
  vlsLawPracticeSchema,
} from 'schemas/vlsLawPracticeSchema';
import type { VlsLawPracticeRegistration } from 'types/vlsLawPractice';
import {
  VLS_LAW_PRACTICE_PAGE_NAME_LABELS,
  VLS_LAW_PRACTICE_PAYMENT_STATUS_OPTIONS,
  formatCaptured,
  formatVlsLawPracticeAmount,
  formatVlsLawPracticeDate,
  formatVlsLawPracticeDateTime,
  formatVlsLawPracticePageName,
} from './vlsLawPracticeUtils';

export type VlsLawPracticeDrawerMode = 'create' | 'edit' | 'view';

interface VlsLawPracticeFormDrawerProps {
  open: boolean;
  mode: VlsLawPracticeDrawerMode;
  registration: VlsLawPracticeRegistration | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: VlsLawPracticeFormValues) => void;
}

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : '');

const VlsLawPracticeFormDrawer = ({
  open,
  mode,
  registration,
  isLoading,
  onClose,
  onSubmit,
}: VlsLawPracticeFormDrawerProps) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const formik = useFormik<VlsLawPracticeFormValues>({
    initialValues: registration
      ? {
          name: registration.name ?? '',
          mobile: registration.mobile ?? '',
          email: registration.email ?? '',
          amount:
            registration.amount === null || registration.amount === undefined
              ? ''
              : String(registration.amount),
          registered_date: toDateInput(registration.registered_date),
          programm_date: toDateInput(registration.programm_date),
          payment_status: registration.payment_status ?? '',
          captured:
            registration.captured === null || registration.captured === undefined
              ? ''
              : (String(registration.captured) as 'true' | 'false'),
          page_name: registration.page_name ?? '',
          ip_address: registration.ip_address ?? '',
          utm_source: registration.utm_source ?? '',
        }
      : vlsLawPracticeInitialValues,
    validationSchema: vlsLawPracticeSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const closeDrawer = () => {
    if (isLoading) return;
    formik.resetForm();
    onClose();
  };

  const renderTextField = (
    name: keyof VlsLawPracticeFormValues,
    label: string,
    type: string = 'text',
    required = false,
  ) => (
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        required={required}
        id={name}
        name={name}
        label={label}
        type={type}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] ? formik.errors[name] : undefined}
        disabled={isLoading}
        inputProps={{
          maxLength: name === 'mobile' ? 20 : undefined,
          step: name === 'amount' ? '0.01' : undefined,
        }}
      />
    </Grid>
  );

  const renderDateField = (name: 'registered_date' | 'programm_date', label: string) => (
    <Grid item xs={12} sm={6}>
      <DatePicker
        label={label}
        value={formik.values[name] ? dayjs(formik.values[name]) : null}
        onChange={(value: Dayjs | null) => {
          void formik.setFieldValue(name, value?.isValid() ? value.format('YYYY-MM-DD') : '');
        }}
        onClose={() => {
          void formik.setFieldTouched(name, true, true);
        }}
        disabled={isLoading}
        slotProps={{
          textField: {
            fullWidth: true,
            onBlur: formik.handleBlur,
            error: formik.touched[name] && Boolean(formik.errors[name]),
            helperText: formik.touched[name] ? formik.errors[name] : undefined,
          },
          actionBar: {
            actions: ['clear'],
          },
        }}
      />
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
    ? 'Law Practice Enrollment'
    : isEdit
      ? 'Edit Law Practice Enrollment'
      : 'Add Law Practice Enrollment';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        sx: { width: { xs: '100vw', sm: 620 }, maxWidth: '100vw', bgcolor: 'background.paper' },
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
                  ? 'Read-only enrollment details'
                  : isEdit
                    ? 'Update the enrollment information below'
                    : 'Create a new Law Practice enrollment'}
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
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
              >
                {viewItem('Name', registration?.name)}
                {viewItem('Mobile', registration?.mobile)}
                {viewItem('Email', registration?.email)}
                {viewItem('Amount', formatVlsLawPracticeAmount(registration?.amount))}
                {viewItem('Registered Date', formatVlsLawPracticeDate(registration?.registered_date))}
                {viewItem('Programme Date', formatVlsLawPracticeDate(registration?.programm_date))}
                {viewItem('Payment Status', registration?.payment_status)}
                {viewItem('Captured', formatCaptured(registration?.captured))}
                {viewItem('Program', formatVlsLawPracticePageName(registration?.page_name))}
                {viewItem('IP Address', registration?.ip_address, true)}
                {viewItem('UTM Source', registration?.utm_source)}
              </Box>
              <Divider />
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
              >
                {viewItem('Created At', formatVlsLawPracticeDateTime(registration?.created_at))}
                {viewItem('Updated At', formatVlsLawPracticeDateTime(registration?.updated_at))}
              </Box>
            </Stack>
          ) : (
            <Grid container spacing={2.5}>
              {renderTextField('name', 'Name', 'text', true)}
              {renderTextField('mobile', 'Mobile', 'tel', true)}
              {renderTextField('email', 'Email', 'email')}
              {renderTextField('amount', 'Amount', 'number')}
              {renderDateField('registered_date', 'Registered Date')}
              {renderDateField('programm_date', 'Programme Date')}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  id="page_name"
                  name="page_name"
                  label="Program"
                  value={formik.values.page_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.page_name && Boolean(formik.errors.page_name)}
                  helperText={formik.touched.page_name ? formik.errors.page_name : undefined}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select program</em>
                  </MenuItem>
                  {VLS_LAW_PRACTICE_PAGE_NAME_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {VLS_LAW_PRACTICE_PAGE_NAME_LABELS[option] || option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  id="payment_status"
                  name="payment_status"
                  label="Payment Status"
                  value={formik.values.payment_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.payment_status && Boolean(formik.errors.payment_status)}
                  helperText={
                    formik.touched.payment_status ? formik.errors.payment_status : undefined
                  }
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select payment status</em>
                  </MenuItem>
                  {VLS_LAW_PRACTICE_PAYMENT_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  id="captured"
                  name="captured"
                  label="Captured"
                  value={formik.values.captured}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.captured && Boolean(formik.errors.captured)}
                  helperText={formik.touched.captured ? formik.errors.captured : undefined}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>Select captured state</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              </Grid>
              {renderTextField('utm_source', 'UTM Source')}
              {renderTextField('ip_address', 'IP Address')}
            </Grid>
          )}
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent="flex-end"
            spacing={1.5}
          >
            <Button variant="outlined" color="inherit" onClick={closeDrawer} disabled={isLoading}>
              {isView ? 'Close' : 'Cancel'}
            </Button>
            {!isView && (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !formik.isValid || !formik.dirty}
                startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : undefined}
              >
                {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Enrollment'}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VlsLawPracticeFormDrawer;
