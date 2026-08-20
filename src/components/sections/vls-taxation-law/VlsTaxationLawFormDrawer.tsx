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
  VlsTaxationLawFormValues,
  vlsTaxationLawInitialValues,
  vlsTaxationLawSchema,
} from 'schemas/vlsTaxationLawSchema';
import type { VlsTaxationLawRegistration } from 'types/vlsTaxationLaw';
import {
  VLS_TAXATION_LAW_PAYMENT_STATUS_OPTIONS,
  formatCaptured,
  formatVlsTaxationLawAmount,
  formatVlsTaxationLawDate,
  formatVlsTaxationLawDateTime,
} from './vlsTaxationLawUtils';

export type VlsTaxationLawDrawerMode = 'create' | 'edit' | 'view';

interface VlsTaxationLawFormDrawerProps {
  open: boolean;
  mode: VlsTaxationLawDrawerMode;
  registration: VlsTaxationLawRegistration | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: VlsTaxationLawFormValues) => void;
}

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : '');

const VlsTaxationLawFormDrawer = ({
  open,
  mode,
  registration,
  isLoading,
  onClose,
  onSubmit,
}: VlsTaxationLawFormDrawerProps) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const formik = useFormik<VlsTaxationLawFormValues>({
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
          razorpay_order_id: registration.razorpay_order_id ?? '',
          razorpay_payment_id: registration.razorpay_payment_id ?? '',
          razorpay_signature: registration.razorpay_signature ?? '',
          payment_status: registration.payment_status ?? '',
          captured:
            registration.captured === null || registration.captured === undefined
              ? ''
              : (String(registration.captured) as 'true' | 'false'),
          page_name: registration.page_name ?? '',
          ip_address: registration.ip_address ?? '',
          utm_source: registration.utm_source ?? '',
          utm_medium: registration.utm_medium ?? '',
          utm_campaign: registration.utm_campaign ?? '',
          utm_term: registration.utm_term ?? '',
          utm_content: registration.utm_content ?? '',
        }
      : vlsTaxationLawInitialValues,
    validationSchema: vlsTaxationLawSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const closeDrawer = () => {
    if (isLoading) return;
    formik.resetForm();
    onClose();
  };

  const renderTextField = (
    name: keyof VlsTaxationLawFormValues,
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
    ? 'Taxation Law Registration'
    : isEdit
      ? 'Edit Taxation Law Registration'
      : 'Add Taxation Law Registration';

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
                  ? 'Read-only registration details'
                  : isEdit
                    ? 'Update the registration information below'
                    : 'Create a new Taxation Law registration'}
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
                {viewItem('Amount', formatVlsTaxationLawAmount(registration?.amount))}
                {viewItem('Registered Date', formatVlsTaxationLawDate(registration?.registered_date))}
                {viewItem('Programme Date', formatVlsTaxationLawDate(registration?.programm_date))}
                {viewItem('Payment Status', registration?.payment_status)}
                {viewItem('Captured', formatCaptured(registration?.captured))}
                {viewItem('Page Name', registration?.page_name)}
                {viewItem('IP Address', registration?.ip_address, true)}
              </Box>
              <Divider />
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
              >
                {viewItem('Razorpay Order ID', registration?.razorpay_order_id, true)}
                {viewItem('Razorpay Payment ID', registration?.razorpay_payment_id, true)}
                {viewItem('Razorpay Signature', registration?.razorpay_signature, true)}
              </Box>
              <Divider />
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
              >
                {viewItem('UTM Source', registration?.utm_source)}
                {viewItem('UTM Medium', registration?.utm_medium)}
                {viewItem('UTM Campaign', registration?.utm_campaign)}
                {viewItem('UTM Term', registration?.utm_term)}
                {viewItem('UTM Content', registration?.utm_content)}
              </Box>
              <Divider />
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
              >
                {viewItem('Created At', formatVlsTaxationLawDateTime(registration?.created_at))}
                {viewItem('Updated At', formatVlsTaxationLawDateTime(registration?.updated_at))}
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
                  {VLS_TAXATION_LAW_PAYMENT_STATUS_OPTIONS.map((status) => (
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
              {renderTextField('page_name', 'Page Name')}
              {renderTextField('ip_address', 'IP Address')}
              {renderTextField('razorpay_order_id', 'Razorpay Order ID')}
              {renderTextField('razorpay_payment_id', 'Razorpay Payment ID')}
              {renderTextField('razorpay_signature', 'Razorpay Signature')}
              {renderTextField('utm_source', 'UTM Source')}
              {renderTextField('utm_medium', 'UTM Medium')}
              {renderTextField('utm_campaign', 'UTM Campaign')}
              {renderTextField('utm_term', 'UTM Term')}
              {renderTextField('utm_content', 'UTM Content')}
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
                {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Registration'}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VlsTaxationLawFormDrawer;
