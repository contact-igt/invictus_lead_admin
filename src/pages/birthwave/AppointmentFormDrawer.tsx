import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { BirthwaveAppointment, BirthwaveDoctor, BirthwaveLead } from 'services/birthwave';
import {
  useCreateBirthwaveAppointmentMutation,
  useUpdateBirthwaveAppointmentMutation,
} from 'components/hooks/useBirthwaveQuery';
import { APPOINTMENT_STATUS_LABELS } from './constants';

interface AppointmentFormDrawerProps {
  clientKey: string | undefined;
  open: boolean;
  onClose: () => void;
  leads: BirthwaveLead[];
  doctors: BirthwaveDoctor[];
  appointment?: BirthwaveAppointment | null;
}

const validationSchema = Yup.object({
  lead_id: Yup.number().required('Lead is required'),
  doctor_id: Yup.number().optional().nullable(),
  service: Yup.string().trim().optional(),
  scheduled_at: Yup.string().required('Scheduled time is required'),
  status: Yup.string().optional(),
  notes: Yup.string().trim().optional(),
});

const toLocalInputValue = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AppointmentFormDrawer = ({ clientKey, open, onClose, leads, doctors, appointment }: AppointmentFormDrawerProps) => {
  const isEdit = Boolean(appointment);
  const { mutate: create, isLoading: isCreating } = useCreateBirthwaveAppointmentMutation(clientKey);
  const { mutate: update, isLoading: isUpdating } = useUpdateBirthwaveAppointmentMutation(clientKey);
  const isLoading = isCreating || isUpdating;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lead_id: appointment?.lead_id ?? '',
      doctor_id: appointment?.doctor_id ?? '',
      service: appointment?.service ?? '',
      scheduled_at: toLocalInputValue(appointment?.scheduled_at),
      status: appointment?.status ?? 'scheduled',
      notes: appointment?.notes ?? '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        lead_id: Number(values.lead_id),
        doctor_id: values.doctor_id ? Number(values.doctor_id) : undefined,
        service: values.service.trim() || undefined,
        scheduled_at: values.scheduled_at ? new Date(values.scheduled_at).toISOString() : undefined,
        status: values.status || undefined,
        notes: values.notes.trim() || undefined,
      };

      const onSuccess = () => {
        resetForm();
        onClose();
      };

      if (isEdit && appointment) {
        update({ id: appointment.id, data: payload }, { onSuccess });
      } else {
        create(payload, { onSuccess });
      }
    },
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{isEdit ? 'Edit Appointment' : 'New Appointment'}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Schedule a Birthwave appointment</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close appointment drawer">
            <Icon icon="mdi:close" width={22} height={22} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 3 }}>
          <Stack direction="column" spacing={2.25}>
            <FormControl fullWidth error={formik.touched.lead_id && Boolean(formik.errors.lead_id)}>
              <InputLabel id="appt-lead-label">Lead</InputLabel>
              <Select labelId="appt-lead-label" name="lead_id" label="Lead" value={formik.values.lead_id} onChange={formik.handleChange}>
                {leads.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>{lead.name} · {lead.phone}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="appt-doctor-label">Doctor</InputLabel>
              <Select labelId="appt-doctor-label" name="doctor_id" label="Doctor" value={formik.values.doctor_id} onChange={formik.handleChange}>
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth name="service" label="Service" value={formik.values.service} onChange={formik.handleChange} />

            <TextField
              fullWidth
              type="datetime-local"
              name="scheduled_at"
              label="Scheduled At"
              InputLabelProps={{ shrink: true }}
              value={formik.values.scheduled_at}
              onChange={formik.handleChange}
              error={formik.touched.scheduled_at && Boolean(formik.errors.scheduled_at)}
              helperText={formik.touched.scheduled_at && formik.errors.scheduled_at}
            />

            <FormControl fullWidth>
              <InputLabel id="appt-status-label">Status</InputLabel>
              <Select labelId="appt-status-label" name="status" label="Status" value={formik.values.status} onChange={formik.handleChange}>
                {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth multiline minRows={3} name="notes" label="Notes" value={formik.values.notes} onChange={formik.handleChange} />
          </Stack>
        </Box>

        <Divider />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: 3, py: 2.25 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Appointment'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default AppointmentFormDrawer;
