import { useState } from 'react';
import { Box, Button, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveDoctorsQuery, useUpdateBirthwaveDoctorMutation } from 'components/hooks/useBirthwaveQuery';
import { BirthwaveDoctor } from 'services/birthwave';
import PortalPageHeader from '../PortalPageHeader';
import DoctorFormDrawer from '../DoctorFormDrawer';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const GREEN = '#29AF81';

const DoctorsPage = () => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<BirthwaveDoctor | null>(null);

  const { data: doctors = [], isLoading } = useBirthwaveDoctorsQuery(scopedClientKey, { search }, { enabled: hasScope });
  const { mutate: updateDoctor } = useUpdateBirthwaveDoctorMutation(scopedClientKey);

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader
        title="Doctors"
        subtitle="Manage the doctors visible across leads and appointments"
        action={
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:plus" width={18} height={18} />}
            onClick={() => {
              setEditingDoctor(null);
              setFormOpen(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
          >
            Add Doctor
          </Button>
        }
      />

      <TextField
        size="small"
        placeholder="Search doctors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5, maxWidth: 320, width: '100%' }}
      />

      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
          </Box>
        ) : doctors.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED }}>No doctors yet — add the first one.</Typography>
          </Box>
        ) : (
          doctors.map((doctor, index) => (
            <Stack
              key={doctor.id}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ px: 3, py: 2, borderTop: index === 0 ? 'none' : '1px solid', borderColor: CARD_BORDER }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK }}>{doctor.name}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED }}>{doctor.specialty || 'General'}</Typography>
              </Box>
              <Chip
                label={doctor.active ? 'Active' : 'Inactive'}
                size="small"
                sx={{
                  bgcolor: doctor.active ? '#F0FDF4' : '#F1F5F9',
                  color: doctor.active ? '#16A34A' : TEXT_MUTED,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                }}
              />
              <Switch
                checked={doctor.active}
                onChange={(e) => updateDoctor({ id: doctor.id, data: { active: e.target.checked } })}
                size="small"
              />
              <Button
                size="small"
                onClick={() => {
                  setEditingDoctor(doctor);
                  setFormOpen(true);
                }}
                sx={{ textTransform: 'none', color: GREEN, fontWeight: 700 }}
              >
                Edit
              </Button>
            </Stack>
          ))
        )}
      </Box>

      <DoctorFormDrawer
        clientKey={scopedClientKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        doctor={editingDoctor}
      />
    </Box>
  );
};

export default DoctorsPage;
