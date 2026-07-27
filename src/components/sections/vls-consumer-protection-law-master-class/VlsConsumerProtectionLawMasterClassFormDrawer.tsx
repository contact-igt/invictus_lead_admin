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
  VlsConsumerProtectionLawMasterClassFormValues,
  vlsConsumerProtectionLawMasterClassInitialValues,
  vlsConsumerProtectionLawMasterClassSchema,
} from 'schemas/vlsConsumerProtectionLawMasterClassSchema';
import type { VlsConsumerProtectionLawMasterClassRegistration } from 'types/vlsConsumerProtectionLawMasterClass';
import {
  VLS_CONSUMER_PROTECTION_PAYMENT_STATUS_OPTIONS,
  formatCaptured,
  formatVlsConsumerProtectionAmount,
  formatVlsConsumerProtectionDate,
  formatVlsConsumerProtectionDateTime,
} from './vlsConsumerProtectionLawMasterClassUtils';

export type VlsConsumerProtectionLawMasterClassDrawerMode = 'create' | 'edit' | 'view';

interface VlsConsumerProtectionLawMasterClassFormDrawerProps {
  open: boolean;
  mode: VlsConsumerProtectionLawMasterClassDrawerMode;
  registration: VlsConsumerProtectionLawMasterClassRegistration | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: VlsConsumerProtectionLawMasterClassFormValues) => void;
}

const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : '');

const VlsConsumerProtectionLawMasterClassFormDrawer = ({
  open,
  mode,
  registration,
  isLoading,
  onClose,
  onSubmit,
}: VlsConsumerProtectionLawMasterClassFormDrawerProps) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const formik = useFormik<VlsConsumerProtectionLawMasterClassFormValues>({
    initialValues: registration
      ? {
          name: registration.name ?? '',
          mobile: registration.mobile ?? '',
          email: registration.email ?? '',
          city: registration.city ?? '',
          profession: registration.profession ?? '',
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
          utm_medium: registration.utm_medium ?? '',
          utm_campaign: registration.utm_campaign ?? '',
          utm_term: registration.utm_term ?? '',
          utm_content: registration.utm_content ?? '',
        }
      : vlsConsumerProtectionLawMasterClassInitialValues,
    validationSchema: vlsConsumerProtectionLawMasterClassSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const closeDrawer = () => {
    if (isLoading) return;
    formik.resetForm();
    onClose();
  };

  const renderTextField = (
    name: keyof VlsConsumerProtectionLawMasterClassFormValues,
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
        helperText={formik.touched[name] && formik.errors[name]}
        disabled={isLoading}
      />
    </Grid>
  );

  const renderDatePicker = (
    name: 'registered_date' | 'programm_date',
    label: string,
  ) => {
    const rawValue = formik.values[name];
    const dayjsValue: Dayjs | null = rawValue ? dayjs(rawValue) : null;

    return (
      <Grid item xs={12} sm={6}>
        <DatePicker
          label={label}
          value={dayjsValue}
          onChange={(newValue) => {
            const formatted = newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD') : '';
            formik.setFieldValue(name, formatted);
          }}
          disabled={isLoading}
          slotProps={{
            textField: {
              fullWidth: true,
              id: name,
              onBlur: formik.handleBlur,
              error: formik.touched[name] && Boolean(formik.errors[name]),
              helperText: formik.touched[name] && formik.errors[name],
            },
          }}
        />
      </Grid>
    );
  };

  const renderViewItem = (label: string, value?: string | number | null) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} color="text.primary">
        {value === null || value === undefined || value === '' ? '-' : String(value)}
      </Typography>
    </Grid>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        <Box p={2.5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isView
              ? 'Registration Details'
              : isEdit
                ? 'Edit Registration'
                : 'New Consumer Protection Law Registration'}
          </Typography>
          <IconButton onClick={closeDrawer} disabled={isLoading} size="small">
            <IconifyIcon icon="mdi:close" width={20} />
          </IconButton>
        </Box>
        <Divider />

        <Box p={3} flexGrow={1} overflow="auto">
          {isView && registration ? (
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                {renderViewItem('Full Name', registration.name)}
                {renderViewItem('Mobile Number', registration.mobile)}
                {renderViewItem('Email Address', registration.email)}
                {renderViewItem('City', registration.city)}
                {renderViewItem('Profession', registration.profession)}
                {renderViewItem('Amount', formatVlsConsumerProtectionAmount(registration.amount))}
                {renderViewItem('Registered Date', formatVlsConsumerProtectionDate(registration.registered_date))}
                {renderViewItem('Programme Date', formatVlsConsumerProtectionDate(registration.programm_date))}
                {renderViewItem('Payment Status', registration.payment_status)}
                {renderViewItem('Captured', formatCaptured(registration.captured))}
                {renderViewItem('Page Name', registration.page_name)}
                {renderViewItem('IP Address', registration.ip_address)}
                {renderViewItem('Razorpay Order ID', registration.razorpay_order_id)}
                {renderViewItem('Razorpay Payment ID', registration.razorpay_payment_id)}
                {renderViewItem('UTM Source', registration.utm_source)}
                {renderViewItem('UTM Medium', registration.utm_medium)}
                {renderViewItem('UTM Campaign', registration.utm_campaign)}
                {renderViewItem('UTM Term', registration.utm_term)}
                {renderViewItem('UTM Content', registration.utm_content)}
                {renderViewItem('Created At', formatVlsConsumerProtectionDateTime(registration.created_at))}
                {renderViewItem('Updated At', formatVlsConsumerProtectionDateTime(registration.updated_at))}
              </Grid>
            </Stack>
          ) : (
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <Grid container spacing={2}>
                {renderTextField('name', 'Full Name', 'text', true)}
                {renderTextField('mobile', 'Mobile Number', 'text', true)}
                {renderTextField('email', 'Email Address', 'email')}
                {renderTextField('city', 'City')}
                {renderTextField('profession', 'Profession')}
                {renderTextField('amount', 'Amount (INR)', 'number')}
                {renderDatePicker('registered_date', 'Registered Date')}
                {renderDatePicker('programm_date', 'Programme Date')}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    id="payment_status"
                    name="payment_status"
                    label="Payment Status"
                    value={formik.values.payment_status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {VLS_CONSUMER_PROTECTION_PAYMENT_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    id="captured"
                    name="captured"
                    label="Captured"
                    value={formik.values.captured}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                  >
                    <MenuItem value="">
                      <em>Unset</em>
                    </MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </TextField>
                </Grid>

                {renderTextField('page_name', 'Page Name')}
                {renderTextField('ip_address', 'IP Address')}
                {renderTextField('utm_source', 'UTM Source')}
                {renderTextField('utm_medium', 'UTM Medium')}
                {renderTextField('utm_campaign', 'UTM Campaign')}
                {renderTextField('utm_term', 'UTM Term')}
                {renderTextField('utm_content', 'UTM Content')}
              </Grid>

              <Box mt={3} display="flex" justifyContent="flex-end" gap={1.5}>
                <Button variant="outlined" onClick={closeDrawer} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? 'Saving...' : isEdit ? 'Update Record' : 'Create Record'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default VlsConsumerProtectionLawMasterClassFormDrawer;
