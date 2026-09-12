import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box, Button, FormControlLabel, Switch, TextField } from '@mui/material';
import { BirthwaveDoctor } from 'services/birthwave';
import { useCreateBirthwaveDoctorMutation, useUpdateBirthwaveDoctorMutation } from 'components/hooks/useBirthwaveQuery';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from './BirthwaveDrawerLayout';

interface DoctorFormDrawerProps {
  clientKey: string | undefined;
  open: boolean;
  onClose: () => void;
  doctor?: BirthwaveDoctor | null;
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  specialty: Yup.string().trim().optional(),
});

const DoctorFormDrawer = ({ clientKey, open, onClose, doctor }: DoctorFormDrawerProps) => {
  const isEdit = Boolean(doctor);
  const createMutation = useCreateBirthwaveDoctorMutation(clientKey);
  const updateMutation = useUpdateBirthwaveDoctorMutation(clientKey);
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: doctor?.name ?? '', specialty: doctor?.specialty ?? '', active: doctor?.active ?? true },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = { name: values.name.trim(), specialty: values.specialty.trim() || undefined, active: values.active };
      const onSuccess = () => { resetForm(); onClose(); };
      if (isEdit && doctor) updateMutation.mutate({ id: doctor.id, data: payload }, { onSuccess });
      else createMutation.mutate(payload, { onSuccess });
    },
  });

  const mutationError = (createMutation.error || updateMutation.error) as { response?: { data?: { message?: string } } } | null;

  return (
    <BirthwaveDrawerLayout
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Doctor' : 'Add Doctor'}
      subtitle="Manage the doctor profile used by leads and appointments"
      width={420}
      footer={<>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button type="submit" form="birthwave-doctor-form" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
          {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Doctor'}
        </Button>
      </>}
    >
      <Box id="birthwave-doctor-form" component="form" onSubmit={formik.handleSubmit} noValidate>
        {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError.response?.data?.message || 'Unable to save this doctor.'}</Alert>}
        <BirthwaveFormGrid>
          <BirthwaveFormGridItem><TextField fullWidth required name="name" label="Doctor name" value={formik.values.name} onChange={formik.handleChange} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><TextField fullWidth name="specialty" label="Specialty" value={formik.values.specialty} onChange={formik.handleChange} /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem fullWidth><FormControlLabel control={<Switch checked={formik.values.active} onChange={(event) => formik.setFieldValue('active', event.target.checked)} />} label={formik.values.active ? 'Active' : 'Inactive'} /></BirthwaveFormGridItem>
        </BirthwaveFormGrid>
      </Box>
    </BirthwaveDrawerLayout>
  );
};

export default DoctorFormDrawer;
