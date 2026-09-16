import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { BirthwaveAppointment, BirthwaveDoctor, BirthwaveLead } from 'services/birthwave';
import {
  useCreateBirthwaveAppointmentMutation,
  useUpdateBirthwaveAppointmentMutation,
} from 'components/hooks/useBirthwaveQuery';
import { APPOINTMENT_STATUS_LABELS } from './constants';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from './BirthwaveDrawerLayout';

interface AppointmentFormDrawerProps {
  clientKey: string | undefined;
  open: boolean;
  onClose: () => void;
  leads: BirthwaveLead[];
  doctors: BirthwaveDoctor[];
  appointment?: BirthwaveAppointment | null;
  /**
   * BW-UI-003: when the drawer is opened from a Lead's own detail page the Lead
   * is already decided — it is pre-selected and locked so a telecaller cannot
   * accidentally book the appointment against a different patient.
   */
  lockedLeadId?: number;
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

const AppointmentFormDrawer = ({ clientKey, open, onClose, leads, doctors, appointment, lockedLeadId }: AppointmentFormDrawerProps) => {
  const isEdit = Boolean(appointment);
  const createMutation = useCreateBirthwaveAppointmentMutation(clientKey);
  const updateMutation = useUpdateBirthwaveAppointmentMutation(clientKey);
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lead_id: appointment?.lead_id ?? lockedLeadId ?? '',
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
      if (isEdit && appointment) updateMutation.mutate({ id: appointment.id, data: payload }, { onSuccess });
      else createMutation.mutate(payload, { onSuccess });
    },
  });

  const mutationError = (createMutation.error || updateMutation.error) as { response?: { data?: { message?: string } } } | null;

  return (
    <BirthwaveDrawerLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Appointment' : 'New Appointment'}
      subtitle="Schedule a Birthwave appointment"
      width={460}
      footer={<>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button type="submit" form="birthwave-appointment-form" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
          {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Appointment'}
        </Button>
      </>}
    >
      <Box id="birthwave-appointment-form" component="form" onSubmit={formik.handleSubmit} noValidate>
        {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError.response?.data?.message || 'Unable to save this appointment.'}</Alert>}
        <BirthwaveFormGrid>
          <BirthwaveFormGridItem><FormControl fullWidth required disabled={Boolean(lockedLeadId)} error={formik.touched.lead_id && Boolean(formik.errors.lead_id)}>
            <InputLabel id="appt-lead-label">Lead</InputLabel>
            <Select labelId="appt-lead-label" name="lead_id" label="Lead" value={formik.values.lead_id} onChange={formik.handleChange}>
              <MenuItem value=""><em>Select a Lead</em></MenuItem>
              {leads.map((lead) => <MenuItem key={lead.id} value={lead.id}>{lead.name}{lead.phone ? ` · ${lead.phone}` : ''}</MenuItem>)}
            </Select>
            {lockedLeadId && <FormHelperText>Booking for this Lead.</FormHelperText>}
            {formik.touched.lead_id && formik.errors.lead_id && <FormHelperText>{formik.errors.lead_id}</FormHelperText>}
          </FormControl></BirthwaveFormGridItem>

          <BirthwaveFormGridItem><FormControl fullWidth>
            <InputLabel id="appt-doctor-label">Doctor</InputLabel>
            <Select labelId="appt-doctor-label" name="doctor_id" label="Doctor" value={formik.values.doctor_id} onChange={formik.handleChange}>
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {doctors.map((doctor) => <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>)}
            </Select>
          </FormControl></BirthwaveFormGridItem>

          <BirthwaveFormGridItem><TextField fullWidth name="service" label="Service" value={formik.values.service} onChange={formik.handleChange} /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><FormControl fullWidth>
            <InputLabel id="appt-status-label">Status</InputLabel>
            <Select labelId="appt-status-label" name="status" label="Status" value={formik.values.status} onChange={formik.handleChange}>
              {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
            </Select>
          </FormControl></BirthwaveFormGridItem>
          <BirthwaveFormGridItem fullWidth><TextField
            fullWidth
            required
            type="datetime-local"
            name="scheduled_at"
            label="Scheduled date and time"
            InputLabelProps={{ shrink: true }}
            value={formik.values.scheduled_at}
            onChange={formik.handleChange}
            error={formik.touched.scheduled_at && Boolean(formik.errors.scheduled_at)}
            helperText={formik.touched.scheduled_at && formik.errors.scheduled_at}
          /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem fullWidth><TextField fullWidth multiline minRows={3} name="notes" label="Notes" value={formik.values.notes} onChange={formik.handleChange} /></BirthwaveFormGridItem>
        </BirthwaveFormGrid>
      </Box>
    </BirthwaveDrawerLayout>
  );
};

export default AppointmentFormDrawer;
