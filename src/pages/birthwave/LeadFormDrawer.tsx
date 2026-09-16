import { useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { BirthwaveDoctor, BirthwaveLead } from 'services/birthwave';
import { useBirthwaveServicesQuery, useCreateBirthwaveLeadMutation, useUpdateBirthwaveLeadMutation } from 'components/hooks/useBirthwaveQuery';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import DynamicCustomFieldInputs from './crm/DynamicCustomFieldInputs';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from './constants';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from './BirthwaveDrawerLayout';

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
  service_id: Yup.string().optional(),
  source: Yup.string().optional(),
  status: Yup.string().optional(),
  assigned_doctor_id: Yup.number().optional().nullable(),
  notes: Yup.string().trim().optional(),
});

const LeadFormDrawer = ({ clientKey, open, onClose, doctors, lead }: LeadFormDrawerProps) => {
  const isEdit = Boolean(lead);
  const createMutation = useCreateBirthwaveLeadMutation(clientKey);
  const updateMutation = useUpdateBirthwaveLeadMutation(clientKey);
  const { mutate: create, isLoading: isCreating } = createMutation;
  const { mutate: update, isLoading: isUpdating } = updateMutation;
  const isLoading = isCreating || isUpdating;
  const { data: customFields = [] } = useCrmFieldsQuery(clientKey, 'birthwave_lead', { enabled: open });
  const formVisibleFields = customFields.filter((f) => f.show_in_form);
  // Active services are the selectable set. A Lead already on a since-deactivated
  // service keeps that option so editing it does not silently clear the service.
  const { data: activeServices = [] } = useBirthwaveServicesQuery(clientKey, { active: true }, { enabled: open });
  const serviceOptions = useMemo(() => {
    const current = lead?.service_ref;
    if (current && !current.is_active && !activeServices.some((service) => service.id === current.id)) {
      return [...activeServices, { ...current, sort_order: Number.MAX_SAFE_INTEGER, is_system: false }];
    }
    return activeServices;
  }, [activeServices, lead?.service_ref]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: lead?.name ?? '',
      phone: lead?.phone ?? '',
      email: lead?.email ?? '',
      service_id: lead?.service_id ? String(lead.service_id) : '',
      source: lead?.source ?? '',
      status: lead?.status ?? 'new_lead',
      assigned_doctor_id: lead?.assigned_doctor_id ?? '',
      notes: lead?.notes ?? '',
      custom_fields: lead?.custom_fields ?? {},
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        // BW-SVC-001: submit the canonical service_id, never a display string.
        service_id: values.service_id ? Number(values.service_id) : null,
        source: values.source || undefined,
        status: values.status || undefined,
        assigned_doctor_id: values.assigned_doctor_id ? Number(values.assigned_doctor_id) : undefined,
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
    <BirthwaveDrawerLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Lead' : 'Add Lead'}
      subtitle={isEdit ? 'Update lead details' : 'Create a new Birthwave lead'}
      width={460}
      footer={<>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button type="submit" form="birthwave-lead-form" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
          {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Lead'}
        </Button>
      </>}
    >
      <Box id="birthwave-lead-form" component="form" onSubmit={formik.handleSubmit} noValidate>
        {createMutation.isError || updateMutation.isError ? <Alert severity="error" sx={{ mb: 2 }}>{((createMutation.error || updateMutation.error) as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to save this Lead.'}</Alert> : null}
          <BirthwaveFormGrid>
            <BirthwaveFormGridItem><TextField
              fullWidth
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={ctrl}
            /></BirthwaveFormGridItem>
            <BirthwaveFormGridItem><TextField
              fullWidth
              name="phone"
              label="Mobile"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              sx={ctrl}
            /></BirthwaveFormGridItem>
            <BirthwaveFormGridItem><TextField
              fullWidth
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={ctrl}
            /></BirthwaveFormGridItem>
            {/*
              BW-SVC-001: the Service field was free text, so every operator typed
              their own spelling and nothing tied a Lead to a managed service. It
              now reads the service master. Active services are the only choices
              for new Leads; when editing a Lead whose service has since been
              deactivated, that service is appended so it still displays and is
              not silently cleared on save.
            */}
            <BirthwaveFormGridItem><FormControl fullWidth sx={ctrl}>
              <InputLabel id="lead-service-label">Service</InputLabel>
              <Select
                labelId="lead-service-label"
                name="service_id"
                label="Service"
                value={formik.values.service_id}
                onChange={formik.handleChange}
              >
                <MenuItem value=""><em>Not specified</em></MenuItem>
                {serviceOptions.map((service) => (
                  <MenuItem key={service.id} value={String(service.id)}>
                    {service.name}
                    {!service.is_active ? ' (inactive)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl></BirthwaveFormGridItem>

            <BirthwaveFormGridItem><FormControl fullWidth sx={ctrl}>
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
            </FormControl></BirthwaveFormGridItem>

            <BirthwaveFormGridItem><FormControl fullWidth sx={ctrl}>
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
            </FormControl></BirthwaveFormGridItem>

            <BirthwaveFormGridItem fullWidth><FormControl fullWidth sx={ctrl}>
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
            </FormControl></BirthwaveFormGridItem>

            <BirthwaveFormGridItem fullWidth><TextField
              fullWidth
              multiline
              minRows={3}
              name="notes"
              label="Notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
            /></BirthwaveFormGridItem>

            {formVisibleFields.length > 0 && (
              <BirthwaveFormGridItem fullWidth><>
                <Divider />
                <DynamicCustomFieldInputs
                  fields={formVisibleFields}
                  values={formik.values.custom_fields}
                  onChange={(key, value) => formik.setFieldValue(`custom_fields.${key}`, value)}
                />
              </></BirthwaveFormGridItem>
            )}
          </BirthwaveFormGrid>
      </Box>
    </BirthwaveDrawerLayout>
  );
};

export default LeadFormDrawer;
