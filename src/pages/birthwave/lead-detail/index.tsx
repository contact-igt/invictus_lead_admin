import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveDoctorsQuery,
  useBirthwaveLeadDetailQuery,
  useBirthwaveLeadTimelineQuery,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveLeadActivity } from 'services/birthwave';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '../constants';
import { buildClientPortalPath } from 'routes/paths';
import LeadFormDrawer from '../LeadFormDrawer';
import { formatCrmFieldValue } from '../crm/formatCrmFieldValue';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const GREEN = '#29AF81';

const cardSx = {
  bgcolor: '#FFFFFF',
  border: '1px solid',
  borderColor: CARD_BORDER,
  borderRadius: '14px',
  p: { xs: 2.5, sm: 3 },
};

const EVENT_ICON: Record<BirthwaveLeadActivity['event_type'], string> = {
  lead_created: 'hugeicons:user-add-01',
  status_changed: 'hugeicons:refresh',
  assignment_changed: 'hugeicons:stethoscope-02',
  follow_up_scheduled: 'hugeicons:calendar-add-01',
  appointment_created: 'hugeicons:calendar-03',
  custom_field_changed: 'hugeicons:pencil-edit-02',
  call_logged: 'hugeicons:call-02',
};


const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 1.1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: TEXT_DARK, textAlign: 'right' }}>{value}</Typography>
  </Stack>
);

const LeadDetailPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: lead, isLoading, isError } = useBirthwaveLeadDetailQuery(scopedClientKey, leadId, { enabled: hasScope });
  const { data: timeline = [], isLoading: isTimelineLoading } = useBirthwaveLeadTimelineQuery(scopedClientKey, leadId, { enabled: hasScope });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const { data: customFieldDefs = [] } = useCrmFieldsQuery(scopedClientKey, 'birthwave_lead', { enabled: hasScope });
  const detailVisibleFields = customFieldDefs.filter((f) => f.show_in_detail);

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
        <Typography sx={{ color: TEXT_MUTED }}>Lead not found.</Typography>
        <Button
          size="small"
          onClick={() => navigate(buildClientPortalPath(activeClientKey, 'leads'))}
          sx={{ mt: 1, textTransform: 'none', color: GREEN }}
        >
          Back to Leads
        </Button>
      </Box>
    );
  }

  const statusColor = lead ? LEAD_STATUS_COLORS[lead.status] || { bg: '#F1F5F9', fg: TEXT_MUTED } : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton
          size="small"
          aria-label="Back to Leads"
          onClick={() => navigate(buildClientPortalPath(activeClientKey, 'leads'))}
          sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '8px' }}
        >
          <Icon icon="hugeicons:arrow-left-01" width={18} height={18} />
        </IconButton>
        <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED }}>Back to Leads</Typography>
      </Stack>

      {isLoading || !lead ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
      ) : (
        <Box sx={{ ...cardSx, mb: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: TEXT_DARK }}>{lead.name}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mt: 0.5 }}>{lead.phone}{lead.email ? ` · ${lead.email}` : ''}</Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {statusColor && (
                <Chip
                  label={LEAD_STATUS_LABELS[lead.status] || lead.status}
                  size="small"
                  sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700 }}
                />
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setEditOpen(true)}
                startIcon={<Icon icon="hugeicons:edit-02" width={16} height={16} />}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: CARD_BORDER, color: TEXT_DARK }}
              >
                Edit
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
            <Box>
              <InfoRow label="Service" value={lead.service || '—'} />
              <InfoRow label="Source" value={lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'} />
              <InfoRow label="Assigned Doctor" value={lead.assignedDoctor?.name || 'Unassigned'} />
            </Box>
            <Box>
              <InfoRow label="Created" value={formatDate(lead.created_at)} />
              <InfoRow label="Next Follow-up" value={formatDate(lead.next_follow_up)} />
              <InfoRow label="Notes" value={lead.notes || '—'} />
            </Box>
          </Box>

          {detailVisibleFields.length > 0 && (
            <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: CARD_BORDER, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
              {detailVisibleFields.map((field) => (
                <InfoRow
                  key={field.id}
                  label={field.label}
                  value={formatCrmFieldValue(field, lead.custom_fields?.[field.field_key])}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box sx={cardSx}>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2.5 }}>Lead Timeline</Typography>

        {isTimelineLoading ? (
          <Stack direction="column" spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '10px' }} />
            ))}
          </Stack>
        ) : timeline.length === 0 ? (
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>No activity recorded yet.</Typography>
        ) : (
          <Stack direction="column" spacing={0}>
            {timeline.map((event, index) => (
              <Stack key={event.id} direction="row" spacing={1.5}>
                <Stack direction="column" alignItems="center" sx={{ flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'rgba(41,175,129,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon={EVENT_ICON[event.event_type] || 'hugeicons:circle'} width={16} height={16} color={GREEN} />
                  </Box>
                  {index < timeline.length - 1 && (
                    <Box sx={{ width: '2px', flexGrow: 1, minHeight: 24, bgcolor: CARD_BORDER, my: 0.5 }} />
                  )}
                </Stack>
                <Box sx={{ pb: 3, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{event.title}</Typography>
                  {event.description && (
                    <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED, mt: 0.25 }}>{event.description}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, mt: 0.5 }}>
                    {formatDateTime(event.occurred_at)}{event.actor_name ? ` · ${event.actor_name}` : ''}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {lead && (
        <LeadFormDrawer
          clientKey={scopedClientKey}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          doctors={doctors}
          lead={lead}
        />
      )}
    </Box>
  );
};

export default LeadDetailPage;
