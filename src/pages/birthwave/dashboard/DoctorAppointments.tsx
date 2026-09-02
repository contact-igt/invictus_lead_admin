import { Box, Skeleton, Stack, Typography, Avatar, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildClientPortalPath } from 'routes/paths';
import { cardSx, sectionTitleSx, GREEN, TEXT_DARK, TEXT_MUTED } from './ui';

interface DoctorAppointmentsProps {
  clientKey: string;
  doctors: Array<{ doctorId: number; name: string; specialty: string | null; appointmentCount: number }>;
  loading?: boolean;
  onDoctorClick?: (doctorId: number) => void;
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const DoctorAppointments = ({ clientKey, doctors, loading, onDoctorClick }: DoctorAppointmentsProps) => (
  <Box sx={cardSx}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography sx={sectionTitleSx}>Doctor-wise Appointments</Typography>
      <MuiLink
        component={Link}
        to={buildClientPortalPath(clientKey, 'doctors')}
        sx={{ fontSize: '0.78rem', fontWeight: 600, color: GREEN, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        View all
      </MuiLink>
    </Stack>

    {loading ? (
      <Stack direction="column" spacing={1.5}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: '10px' }} />
        ))}
      </Stack>
    ) : doctors.length === 0 ? (
      <Typography variant="body2" sx={{ color: TEXT_MUTED, py: 2 }}>
        No appointments assigned to doctors yet.
      </Typography>
    ) : (
      <Stack direction="column" spacing={1.5}>
        {doctors.map((doctor) => (
          <Stack
            key={doctor.doctorId}
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => onDoctorClick?.(doctor.doctorId)}
            role={onDoctorClick ? 'button' : undefined}
            tabIndex={onDoctorClick ? 0 : undefined}
            aria-label={onDoctorClick ? `View appointments for ${doctor.name}` : undefined}
            onKeyDown={(e) => {
              if (onDoctorClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onDoctorClick(doctor.doctorId);
              }
            }}
            sx={{
              cursor: onDoctorClick ? 'pointer' : 'default',
              borderRadius: '8px',
              mx: -0.75,
              px: 0.75,
              py: 0.25,
              '&:hover': onDoctorClick ? { bgcolor: 'var(--bw-hover)' } : undefined,
              '&:focus-visible': onDoctorClick ? { outline: '2px solid #29AF81', outlineOffset: 1 } : undefined,
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(41,175,129,0.12)', color: GREEN, fontSize: 13, fontWeight: 700 }}>
              {initials(doctor.name)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>
                {doctor.name}
              </Typography>
              {doctor.specialty && (
                <Typography noWrap sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>
                  {doctor.specialty}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>
              {doctor.appointmentCount}
            </Typography>
          </Stack>
        ))}
      </Stack>
    )}
  </Box>
);

export default DoctorAppointments;
