import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Chip, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveAppointmentsQuery,
  useBirthwaveDoctorsQuery,
  useBirthwaveLeadsQuery,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveAppointment } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from '../constants';
import PortalPageHeader from '../PortalPageHeader';
import AppointmentFormDrawer from '../AppointmentFormDrawer';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const AppointmentsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<BirthwaveAppointment | null>(null);

  const doctorId = searchParams.get('doctor_id') || '';
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const setSingleDate = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('from', value);
      params.set('to', value);
    } else {
      params.delete('from');
      params.delete('to');
    }
    setSearchParams(params, { replace: true });
  };

  const params = useMemo(
    () => ({
      doctor_id: doctorId || undefined,
      status: status || undefined,
      start_date: from || undefined,
      end_date: to || undefined,
      limit: 50,
    }),
    [doctorId, status, from, to],
  );

  const { data, isLoading } = useBirthwaveAppointmentsQuery(scopedClientKey, params, { enabled: hasScope });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const { data: leadsData } = useBirthwaveLeadsQuery(scopedClientKey, { limit: 100 }, { enabled: hasScope });
  const appointments = data?.data ?? [];
  const leads = leadsData?.data ?? [];

  const activeDoctorName = doctorId ? doctors.find((d) => String(d.id) === doctorId)?.name : null;
  const activeFilters = [
    status && { key: 'status', label: APPOINTMENT_STATUS_LABELS[status] || status },
    doctorId && { key: 'doctor_id', label: activeDoctorName || `Doctor #${doctorId}` },
    from && to && from !== to && { key: 'range', label: `${from} → ${to}` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

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
        title="Appointments"
        subtitle="Schedule and track Birthwave appointments"
        action={
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:plus" width={18} height={18} />}
            onClick={() => {
              setEditingAppointment(null);
              setFormOpen(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
          >
            New Appointment
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={activeFilters.length ? 1.5 : 2.5}>
        <TextField size="small" type="date" value={from === to ? from : ''} onChange={(e) => setSingleDate(e.target.value)} sx={{ minWidth: 170 }} />
        <Select size="small" displayEmpty value={doctorId} onChange={(e) => updateParam('doctor_id', e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">All Doctors</MenuItem>
          {doctors.map((doctor) => (
            <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
          ))}
        </Select>
        <Select size="small" displayEmpty value={status} onChange={(e) => updateParam('status', e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
      </Stack>

      {activeFilters.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} mb={2.5}>
          {activeFilters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onDelete={() => {
                if (f.key === 'range') {
                  const p = new URLSearchParams(searchParams);
                  p.delete('from');
                  p.delete('to');
                  setSearchParams(p, { replace: true });
                } else {
                  updateParam(f.key, '');
                }
              }}
              sx={{ bgcolor: 'rgba(41,175,129,0.1)', color: GREEN, fontWeight: 600 }}
            />
          ))}
        </Stack>
      )}

      <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED }}>No appointments match these filters.</Typography>
          </Box>
        ) : (
          appointments.map((appt, index) => {
            const statusColor = APPOINTMENT_STATUS_COLORS[appt.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
            return (
              <Stack
                key={appt.id}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1, sm: 2 }}
                onClick={() => appt.lead && navigate(buildClientPortalPath(activeClientKey, `leads/${appt.lead.id}`))}
                role={appt.lead ? 'button' : undefined}
                tabIndex={appt.lead ? 0 : undefined}
                aria-label={appt.lead ? `Open ${appt.lead.name}` : undefined}
                onKeyDown={(e) => {
                  if (appt.lead && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    navigate(buildClientPortalPath(activeClientKey, `leads/${appt.lead.id}`));
                  }
                }}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderTop: index === 0 ? 'none' : '1px solid',
                  borderColor: CARD_BORDER,
                  cursor: appt.lead ? 'pointer' : 'default',
                  '&:hover': appt.lead ? { bgcolor: 'var(--bw-hover)' } : undefined,
                  '&:focus-visible': appt.lead ? { outline: '2px solid #29AF81', outlineOffset: -2 } : undefined,
                }}
              >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, width: { sm: 130 }, flexShrink: 0 }}>
                  {formatDateTime(appt.scheduled_at)}
                </Typography>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>{appt.lead?.name || 'Unknown lead'}</Typography>
                  <Typography noWrap sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>
                    {appt.service || 'Consultation'}{appt.doctor ? ` · ${appt.doctor.name}` : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={APPOINTMENT_STATUS_LABELS[appt.status] || appt.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700, fontSize: '0.68rem' }} />
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAppointment(appt);
                      setFormOpen(true);
                    }}
                    sx={{ textTransform: 'none', color: GREEN, fontWeight: 700, minWidth: 0 }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Stack>
            );
          })
        )}
      </Box>

      <AppointmentFormDrawer
        clientKey={scopedClientKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        leads={leads}
        doctors={doctors}
        appointment={editingAppointment}
      />
    </Box>
  );
};

export default AppointmentsPage;
