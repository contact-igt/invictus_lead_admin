import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Drawer, Grid, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import IconifyIcon from 'components/base/IconifyIcon';
import { isLeadFollowUpLocked } from './pixelEyeStatuses';
import { PixelEyeRow } from './pixelEyeTable';
import useColorMode from 'hooks/useColorMode';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { getPixelEyeFieldSx, getPixelEyeMenuProps } from './pixelEyeUi';
import PixelEyeDatePicker from './PixelEyeDatePicker';
import PixelEyeField from './PixelEyeField';

const DEFAULT_AGENT_NAMES = ['Shadan', 'PXLS RECEPTION SN'] as const;

export interface PixelEyeLeadFormValues {
  date: string;
  time: string;
  call_id: string;
  customer_name: string;
  phone_number: string;
  agent_name: string;
  status: string;
  source?: string;
  type_of_enquiry?: string;
  follow_up_date?: string;
}

interface PixelEyeLeadDrawerProps {
  mode: 'create' | 'edit';
  open: boolean;
  lead?: PixelEyeRow | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: PixelEyeLeadFormValues) => void;
}

const validationSchema = Yup.object({
  date: Yup.string().required('Date is required'),
  time: Yup.string().required('Time is required'),
  call_id: Yup.string().trim().required('Call ID is required'),
  customer_name: Yup.string().trim().required('Customer name is required'),
  phone_number: Yup.string().trim().required('Phone number is required'),
  agent_name: Yup.string().trim().nullable(),
  status: Yup.string().trim().required('Status is required'),
  source: Yup.string().nullable(),
  type_of_enquiry: Yup.string().nullable(),
  follow_up_date: Yup.string().nullable(),
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { mode } = useColorMode();
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: mode === 'dark' ? '#13231d' : '#F8FAFC',
        border: '1px solid',
        borderColor: mode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : 'rgba(226, 232, 240, 0.8)',
        width: '100%',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, color: mode === 'dark' ? '#dcebe2' : '#0F172A', fontWeight: 800 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

const PixelEyeLeadDrawer = ({
  mode,
  open,
  lead,
  isLoading,
  onClose,
  onSubmit,
}: PixelEyeLeadDrawerProps) => {
  const { mode: colorMode } = useColorMode();
  const { user } = useAuth();
  const isEdit = mode === 'edit';
  const userRole = (user?.role || '').toLowerCase().trim();
  const leadHasFollowUpDate = Boolean(String(lead?.follow_up_date || '').trim());
  const leadFollowUpLocked = isLeadFollowUpLocked(lead);
  const canEditFollowUpDate =
    !isEdit ||
    ((!leadFollowUpLocked && (userRole === 'super-admin' || userRole === 'admin')) ||
      (!leadFollowUpLocked && userRole === 'client' && !leadHasFollowUpDate));
  const showReadOnlyFollowUpDate =
    isEdit && (leadFollowUpLocked || (userRole === 'client' && leadHasFollowUpDate));
  const agentOptions =
    lead?.agent_name &&
      !DEFAULT_AGENT_NAMES.includes(lead.agent_name as (typeof DEFAULT_AGENT_NAMES)[number])
      ? [lead.agent_name, ...DEFAULT_AGENT_NAMES]
      : [...DEFAULT_AGENT_NAMES];

  const drawerPaperSx = {
    width: { xs: '100%', sm: 560, md: 620 },
    maxWidth: '100%',
    background: colorMode === 'dark' ? '#0f1b16' : '#ffffff',
    color: colorMode === 'dark' ? '#f4fbf6' : '#0F172A',
    borderLeft: `1px solid ${colorMode === 'dark' ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'}`,
  };

  const fieldSx = getPixelEyeFieldSx(colorMode as any);
  const menuProps = getPixelEyeMenuProps(colorMode as any);

  const formik = useFormik<PixelEyeLeadFormValues>({
    initialValues: {
      date: lead?.date || '',
      time: lead?.time || '',
      call_id: lead?.call_id || '',
      customer_name: lead?.customer_name || '',
      phone_number: lead?.phone_number || '',
      agent_name: lead?.agent_name || '',
      status: lead?.status || '',
      source: lead?.source || '',
      type_of_enquiry: lead?.type_of_enquiry || '',
      follow_up_date: lead?.follow_up_date || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const drawerPayload: PixelEyeLeadFormValues = {
        date: values.date,
        time: values.time,
        call_id: values.call_id.trim(),
        customer_name: values.customer_name.trim(),
        phone_number: values.phone_number.trim(),
        agent_name: (values.agent_name || '').trim(),
        status: values.status,
        source: values.source,
        type_of_enquiry: values.type_of_enquiry,
      };

      if (canEditFollowUpDate) {
        drawerPayload.follow_up_date = values.follow_up_date;
      }

      onSubmit(drawerPayload);
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
    // formik is intentionally omitted to reset only when the drawer closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renderTextField = (
    name: keyof PixelEyeLeadFormValues,
    label: string,
    props?: {
      type?: string;
      required?: boolean;
      multiline?: boolean;
      rows?: number;
      placeholder?: string;
    },
  ) => {
    if (props?.type === 'date') {
      return (
        <PixelEyeDatePicker
          fullWidth={true}
          label={label}
          value={formik.values[name] || ''}
          onChange={(val) => formik.setFieldValue(name, val)}
          disabled={isLoading}
        />
      );
    }

    return (
      <PixelEyeField
        fullWidth
        name={name}
        label={label}
        type={props?.type || 'text'}
        required={props?.required}
        value={formik.values[name] || ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
        multiline={props?.multiline}
        rows={props?.rows}
        placeholder={props?.placeholder}
        InputLabelProps={props?.type === 'time' ? { shrink: true } : undefined}
        sx={fieldSx}
      />
    );
  };

  const renderSelect = (
    name: keyof PixelEyeLeadFormValues,
    label: string,
    options: string[],
    required = false,
    allowEmpty = true,
  ) => (
    <PixelEyeField
      select
      fullWidth
      required={required}
      name={String(name)}
      label={label}
      value={formik.values[name] || ''}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={Boolean(formik.touched[name] && formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      sx={fieldSx}
      SelectProps={{ ...menuProps, displayEmpty: allowEmpty }}
    >
      {allowEmpty && <MenuItem value="">None</MenuItem>}
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </PixelEyeField>
  );

  const renderFollowUpDateField = () => {
    if (showReadOnlyFollowUpDate) {
      const helperText = leadFollowUpLocked
        ? 'Follow-up date is locked for closed or completed leads.'
        : 'Use Reschedule to change follow-up date.';

      return (
        <PixelEyeField
          fullWidth
          label="Follow-up Date"
          type="date"
          value={formik.values.follow_up_date || ''}
          disabled
          helperText={helperText}
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />
      );
    }

    return (
      <PixelEyeDatePicker
        fullWidth={true}
        label="Follow-up Date"
        value={formik.values.follow_up_date || ''}
        onChange={(val) => formik.setFieldValue('follow_up_date', val)}
        disabled={isLoading || !canEditFollowUpDate}
      />
    );
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      // mark all fields as touched so helperText appears
      const touched: Record<string, boolean> = {};
      Object.keys(formik.initialValues).forEach((k) => (touched[k] = true));
      formik.setTouched(touched);
      enqueueSnackbar('Please fill the required fields', { variant: 'warning' });
      return;
    }
    formik.handleSubmit(e as any);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: drawerPaperSx }}
      ModalProps={{
        BackdropProps: {
          sx: { backgroundColor: 'rgba(2, 8, 6, 0.68)' },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleFormSubmit}
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A' }}
            >
              {isEdit ? 'Edit PixelEye Lead' : 'Add PixelEye Lead'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: colorMode === 'dark' ? '#9fb0a6' : '#64748B' }}
            >
              {isEdit
                ? 'Update lead details and status. Reschedule follow-up from the Follow-up Page.'
                : 'Create a new lead and schedule follow-up if required.'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: colorMode === 'dark' ? '#cfe2d5' : '#64748B' }}
            aria-label="Close drawer"
          >
            <IconifyIcon icon="mdi:close" width={20} />
          </IconButton>
        </Stack>

        <Stack
          direction="column"
          spacing={2.5}
          sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, width: '100%' }}
        >
          <Section title="Lead Information">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderTextField('customer_name', 'Customer Name', { required: true })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('phone_number', 'Phone Number', { required: true })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelect('agent_name', 'Agent Name', agentOptions)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('status', 'Status', {
                  required: true,
                  placeholder: 'Enter status',
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelect('source', 'Source', [
                  'Website',
                  'Facebook',
                  'Google',
                  'Referral',
                  'Walk-in',
                  'Other',
                ])}
              </Grid>
              <Grid item xs={12}>
                {renderSelect('type_of_enquiry', 'Type of Enquiry', [
                  'General',
                  'OPD',
                  'Surgery',
                  'Emergency',
                  'Diagnostics',
                  'Other',
                ])}
              </Grid>
            </Grid>
          </Section>

          <Section title="Call Information">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderTextField('date', 'Date', { type: 'date', required: true })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('time', 'Time', { type: 'time', required: true })}
              </Grid>
              <Grid item xs={12}>
                {renderTextField('call_id', 'Call ID', { required: true })}
              </Grid>
            </Grid>
          </Section>

          <Section title="Follow-up">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderFollowUpDateField()}
              </Grid>
            </Grid>
          </Section>
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
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ color: colorMode === 'dark' ? '#cfe2d5' : '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              backgroundColor: colorMode === 'dark' ? '#1f6b40' : '#1F6B40',
              '&:hover': {
                backgroundColor: colorMode === 'dark' ? '#227a4b' : '#154f2e',
              },
            }}
          >
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default PixelEyeLeadDrawer;
