import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { BirthwaveDoctor, BirthwaveLead } from 'services/birthwave';
import { useCreateBirthwaveLeadMutation, useUpdateBirthwaveLeadMutation } from 'components/hooks/useBirthwaveQuery';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import DynamicCustomFieldInputs from './crm/DynamicCustomFieldInputs';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from './constants';

interface LeadFormDrawerProps {
  clientKey: string | undefined;
  open: boolean;
  onClose: () => void;
  doctors: BirthwaveDoctor[];
  lead?: BirthwaveLead | null;
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  phone: Yup.string().trim().required('Mobile number is required'),
  email: Yup.string().trim().email('Invalid email').optional(),
  service: Yup.string().trim().optional(),
  source: Yup.string().optional(),
  status: Yup.string().optional(),
  assigned_doctor_id: Yup.number().optional().nullable(),
  next_follow_up: Yup.string().optional(),
  notes: Yup.string().trim().optional(),
});

const toDateInputValue = (value: string | null) => (value ? value.slice(0, 10) : '');

const LeadFormDrawer = ({ clientKey, open, onClose, doctors, lead }: LeadFormDrawerProps) => {
  const isEdit = Boolean(lead);
  const { mutate: create, isLoading: isCreating } = useCreateBirthwaveLeadMutation(clientKey);
  const { mutate: update, isLoading: isUpdating } = useUpdateBirthwaveLeadMutation(clientKey);
  const isLoading = isCreating || isUpdating;
  const { data: customFields = [] } = useCrmFieldsQuery(clientKey, 'birthwave_lead', { enabled: open });
  const formVisibleFields = customFields.filter((f) => f.show_in_form);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: lead?.name ?? '',
      phone: lead?.phone ?? '',
      email: lead?.email ?? '',
      service: lead?.service ?? '',
      source: lead?.source ?? '',
      status: lead?.status ?? 'new_lead',
      assigned_doctor_id: lead?.assigned_doctor_id ?? '',
      next_follow_up: toDateInputValue(lead?.next_follow_up ?? null),
      notes: lead?.notes ?? '',
      custom_fields: lead?.custom_fields ?? {},
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        service: values.service.trim() || undefined,
        source: values.source || undefined,
        status: values.status || undefined,
        assigned_doctor_id: values.assigned_doctor_id ? Number(values.assigned_doctor_id) : undefined,
        next_follow_up: values.next_follow_up || undefined,
        notes: values.notes.trim() || undefined,
        custom_fields: values.custom_fields,
      };

      const onSuccess = () => {
        resetForm();
        onClose();
      };

      if (isEdit && lead) {
        update({ id: lead.id, data: payload }, { onSuccess });
      } else {
        create(payload, { onSuccess });
      }
    },
  });

  const ctrl = { '& .MuiInputBase-root': { height: 44 } };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{isEdit ? 'Edit Lead' : 'Add Lead'}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {isEdit ? 'Update lead details' : 'Create a new Birthwave lead'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close lead drawer">
            <Icon icon="mdi:close" width={22} height={22} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 3 }}>
          <Stack direction="column" spacing={2.25}>
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={ctrl}
            />
            <TextField
              fullWidth
              name="phone"
              label="Mobile"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              sx={ctrl}
            />
            <TextField
              fullWidth
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={ctrl}
            />
            <TextField
              fullWidth
              name="service"
              label="Service"
              value={formik.values.service}
              onChange={formik.handleChange}
              sx={ctrl}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth sx={ctrl}>
                <InputLabel id="lead-source-label">Source</InputLabel>
                <Select
                  labelId="lead-source-label"
                  name="source"
                  label="Source"
                  value={formik.values.source}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={ctrl}>
                <InputLabel id="lead-status-label">Status</InputLabel>
                <Select
                  labelId="lead-status-label"
                  name="status"
                  label="Status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                >
                  {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth sx={ctrl}>
              <InputLabel id="lead-doctor-label">Assigned Doctor</InputLabel>
              <Select
                labelId="lead-doctor-label"
                name="assigned_doctor_id"
                label="Assigned Doctor"
                value={formik.values.assigned_doctor_id}
                onChange={formik.handleChange}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Optional</FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              name="next_follow_up"
              label="Next Follow-up"
              InputLabelProps={{ shrink: true }}
              value={formik.values.next_follow_up}
              onChange={formik.handleChange}
              sx={ctrl}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              name="notes"
              label="Notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
            />

            {formVisibleFields.length > 0 && (
              <>
                <Divider />
                <DynamicCustomFieldInputs
                  fields={formVisibleFields}
                  values={formik.values.custom_fields}
                  onChange={(key, value) => formik.setFieldValue(`custom_fields.${key}`, value)}
                />
              </>
            )}
          </Stack>
        </Box>

        <Divider />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: 3, py: 2.25 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Lead'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default LeadFormDrawer;
