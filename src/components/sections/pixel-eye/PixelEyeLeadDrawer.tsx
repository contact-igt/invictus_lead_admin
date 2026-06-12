import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Drawer, Grid, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ALL_STATUSES, getDayDropdownStatuses } from './pixelEyeStatuses';
import { PixelEyeRow } from './pixelEyeTable';
import useColorMode from 'hooks/useColorMode';
import { getPixelEyeFieldSx, getPixelEyeMenuProps } from './pixelEyeUi';
import PixelEyeDatePicker from './PixelEyeDatePicker';
import PixelEyeField from './PixelEyeField';

const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;
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
  day_1?: string;
  day_2?: string;
  day_3?: string;
  day_4?: string;
  day_5?: string;
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
  day_1: Yup.string().nullable(),
  day_2: Yup.string().nullable(),
  day_3: Yup.string().nullable(),
  day_4: Yup.string().nullable(),
  day_5: Yup.string().nullable(),
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
  const isEdit = mode === 'edit';
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
      day_1: lead?.day_1 || '',
      day_2: lead?.day_2 || '',
      day_3: lead?.day_3 || '',
      day_4: lead?.day_4 || '',
      day_5: lead?.day_5 || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        call_id: values.call_id.trim(),
        customer_name: values.customer_name.trim(),
        phone_number: values.phone_number.trim(),
        agent_name: values.agent_name.trim(),
      });
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
    props?: { type?: string; required?: boolean },
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
        onSubmit={formik.handleSubmit}
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
                ? 'Update lead details, status, and follow-up information.'
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
                {renderSelect('status', 'Status', ALL_STATUSES as unknown as string[], true, false)}
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
                {renderTextField('follow_up_date', 'Follow-up Date', { type: 'date' })}
              </Grid>
              {DAY_FIELDS.map((day, index) => (
                <Grid item xs={12} sm={6} key={day}>
                  {renderSelect(day, `Day ${index + 1}`, getDayDropdownStatuses(index + 1))}
                </Grid>
              ))}
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
