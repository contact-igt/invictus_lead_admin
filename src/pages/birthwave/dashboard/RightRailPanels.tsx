import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { BirthwaveAppointment, BirthwaveLead } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from '../constants';
import { cardSx, sectionTitleSx, TEXT_DARK, TEXT_MUTED, CARD_BORDER } from './ui';

interface RightRailPanelsProps {
  clientKey: string;
  followUps: BirthwaveLead[];
  schedule: BirthwaveAppointment[];
  loading?: boolean;
}

const dayDiff = (value: string) => {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const FollowUpBadge = ({ dueValue }: { dueValue: string }) => {
  const diff = dayDiff(dueValue);
  if (diff < 0) return <Chip label="Overdue" size="small" sx={{ bgcolor: 'var(--bw-tint-red)', color: '#EF4444', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />;
  if (diff === 0) return <Chip label="Today" size="small" sx={{ bgcolor: 'var(--bw-tint-amber)', color: '#F59E0B', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />;
  return <Chip label={formatDate(dueValue)} size="small" sx={{ bgcolor: 'var(--bw-surface-2)', color: TEXT_MUTED, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />;
};

const RightRailPanels = ({ clientKey, followUps, schedule, loading }: RightRailPanelsProps) => {
  const navigate = useNavigate();
  const goToLead = (leadId: number) => navigate(buildClientPortalPath(clientKey, `leads/${leadId}`));

  return (
  <Stack direction="column" spacing={2.5}>
    {/* Follow-up Reminders */}
    <Box sx={cardSx}>
      <Typography sx={{ ...sectionTitleSx, mb: 1.75 }}>Follow-up Reminders</Typography>
      {loading ? (
        <Stack direction="column" spacing={1.25}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={46} sx={{ borderRadius: '10px' }} />
          ))}
        </Stack>
      ) : followUps.length === 0 ? (
        <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
          No follow-ups scheduled.
        </Typography>
      ) : (
        <Stack direction="column" spacing={1.5}>
          {followUps.map((lead) => (
            <Stack
              key={lead.id}
              direction="row"
              alignItems="center"
              spacing={1.25}
              onClick={() => goToLead(lead.id)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${lead.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToLead(lead.id);
                }
              }}
              sx={{ cursor: 'pointer', borderRadius: '8px', mx: -1, px: 1, py: 0.25, '&:hover': { bgcolor: 'var(--bw-hover)' }, '&:focus-visible': { outline: '2px solid #29AF81', outlineOffset: 1 } }}
            >
              <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: 'rgba(41,175,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon icon="hugeicons:call-02" width={14} height={14} color="#29AF81" />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT_DARK }}>
                  {lead.name}
                </Typography>
                <Typography noWrap sx={{ fontSize: '0.7rem', color: TEXT_MUTED }}>
                  {lead.service || 'General enquiry'}
                </Typography>
              </Box>
              {lead.next_follow_up && <FollowUpBadge dueValue={lead.next_follow_up} />}
            </Stack>
          ))}
        </Stack>
      )}
    </Box>

    {/* Today's Schedule */}
    <Box sx={cardSx}>
      <Typography sx={{ ...sectionTitleSx, mb: 1.75 }}>Today&apos;s Schedule</Typography>
      {loading ? (
        <Stack direction="column" spacing={1.25}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={46} sx={{ borderRadius: '10px' }} />
          ))}
        </Stack>
      ) : schedule.length === 0 ? (
        <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
          No appointments scheduled for today.
        </Typography>
      ) : (
        <Stack direction="column" spacing={0}>
          {schedule.map((appt, index) => {
            const statusColor = APPOINTMENT_STATUS_COLORS[appt.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
            return (
              <Stack
                key={appt.id}
                direction="row"
                alignItems="center"
                spacing={1.25}
                onClick={() => appt.lead && goToLead(appt.lead.id)}
                role={appt.lead ? 'button' : undefined}
                tabIndex={appt.lead ? 0 : undefined}
                aria-label={appt.lead ? `Open ${appt.lead.name}` : undefined}
                onKeyDown={(e) => {
                  if (appt.lead && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    goToLead(appt.lead.id);
                  }
                }}
                sx={{
                  py: 1.15,
                  borderTop: index === 0 ? 'none' : '1px solid',
                  borderColor: CARD_BORDER,
                  cursor: appt.lead ? 'pointer' : 'default',
                  '&:hover': appt.lead ? { bgcolor: 'var(--bw-hover)' } : undefined,
                  '&:focus-visible': appt.lead ? { outline: '2px solid #29AF81', outlineOffset: 1 } : undefined,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: TEXT_DARK, width: 58, flexShrink: 0 }}>
                  {formatTime(appt.scheduled_at)}
                </Typography>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT_DARK }}>
                    {appt.lead?.name || 'Unknown'}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '0.7rem', color: TEXT_MUTED }}>
                    {appt.service || 'Consultation'}{appt.doctor ? ` · ${appt.doctor.name}` : ''}
                  </Typography>
                </Box>
                <Chip
                  label={APPOINTMENT_STATUS_LABELS[appt.status] || appt.status}
                  size="small"
                  sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700, fontSize: '0.63rem', height: 20 }}
                />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Box>
  </Stack>
  );
};

export default RightRailPanels;
