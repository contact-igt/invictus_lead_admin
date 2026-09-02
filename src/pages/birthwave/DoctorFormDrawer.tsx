import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { BirthwaveDoctor } from 'services/birthwave';
import { useCreateBirthwaveDoctorMutation, useUpdateBirthwaveDoctorMutation } from 'components/hooks/useBirthwaveQuery';

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
  const { mutate: create, isLoading: isCreating } = useCreateBirthwaveDoctorMutation(clientKey);
  const { mutate: update, isLoading: isUpdating } = useUpdateBirthwaveDoctorMutation(clientKey);
  const isLoading = isCreating || isUpdating;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: doctor?.name ?? '',
      specialty: doctor?.specialty ?? '',
      active: doctor?.active ?? true,
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const payload = { name: values.name.trim(), specialty: values.specialty.trim() || undefined, active: values.active };
      const onSuccess = () => {
        resetForm();
        onClose();
      };

      if (isEdit && doctor) {
        update({ id: doctor.id, data: payload }, { onSuccess });
      } else {
        create(payload, { onSuccess });
      }
    },
  });

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{isEdit ? 'Edit Doctor' : 'Add Doctor'}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Manage Birthwave doctor profile</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close doctor drawer">
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
            />
            <TextField
              fullWidth
              name="specialty"
              label="Specialty"
              value={formik.values.specialty}
              onChange={formik.handleChange}
            />
            <FormControlLabel
              control={<Switch checked={formik.values.active} onChange={(e) => formik.setFieldValue('active', e.target.checked)} />}
              label="Active"
            />
          </Stack>
        </Box>

        <Divider />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: 3, py: 2.25 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formik.isValid || (!formik.dirty && !isEdit)}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Doctor'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default DoctorFormDrawer;
