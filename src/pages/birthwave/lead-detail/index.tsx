import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const cardSx = {
  bgcolor: 'var(--bw-surface)',
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
  lead_source_activity: 'hugeicons:share-01',
};


const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1.1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, flexShrink: 0 }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: TEXT_DARK,
        textAlign: 'right',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        minWidth: 0,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const LeadDetailPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);

  // Return to whichever list the user came from (Instagram Leads / a website
  // source), preserved via ?view= on the detail URL. Defaults to All Leads.
  const originView = searchParams.get('view');
  const backToLeadsPath = `leads${originView && originView !== 'crm' ? `?view=${encodeURIComponent(originView)}` : ''}`;

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
          onClick={() => navigate(buildClientPortalPath(activeClientKey, backToLeadsPath))}
          sx={{ mt: 1, textTransform: 'none', color: GREEN }}
        >
          Back to Leads
        </Button>
      </Box>
    );
  }

  const statusColor = lead ? LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED } : null;

  // Repli/Instagram integration metadata — reuses the existing lead's
  // integration_metadata JSON, no separate Repli lead architecture.
  // Repli's payload shape varies by automation flow, so beyond the
  // handful of well-known keys everything else is rendered dynamically
  // rather than hardcoded, so new/renamed keys still show up.
  const meta = lead?.integration_metadata;
  const isRepliLead = lead?.source_provider === 'REPLI';

  const ISO_DATE_KEY_HINT = /(_at|_date|timestamp)$/i;
  const humanizeKey = (key: string) =>
    key
      .replace(/^repli_/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  const formatMetaValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && ISO_DATE_KEY_HINT.test(key)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return formatDateTime(value);
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Collected-data keys are the raw questionnaire questions and vary per flow,
  // so they're rendered dynamically. Well-known intents get a short label;
  // anything unrecognised falls back to the question text verbatim.
  const friendlyQuestionLabel = (question: string): string => {
    const q = question.toLowerCase();
    if (/\bname\b/.test(q)) return 'Name';
    if (/e-?mail/.test(q)) return 'Email';
    if (/phone|mobile|whatsapp|contact number|\bnumber\b/.test(q)) return 'Phone';
    if (/service|treatment|reason|help/.test(q)) return 'Service';
    return question.trim();
  };

  const collectedData =
    meta?.collected_data && typeof meta.collected_data === 'object' && !Array.isArray(meta.collected_data)
      ? (meta.collected_data as Record<string, unknown>)
      : null;
  const collectedEntries = collectedData ? Object.entries(collectedData) : [];

  // Keys shown elsewhere (mandatory rows / collected details section) so they
  // aren't duplicated in the dynamic metadata list below.
  const KNOWN_META_KEYS = new Set([
    'collected_data',
    'source',
    'source_provider',
    'provider',
    'instagram_username',
    'answers',
  ]);
  // Raw/nested payloads (Repli's full webhook body, etc.) are unbounded and
  // not meant for a label/value row — kept out of the detail view entirely.
  const RAW_PAYLOAD_KEY_HINT = /(response|payload|raw|webhook)/i;
  const dynamicMetaEntries = meta
    ? Object.entries(meta).filter(([key, value]) => {
        if (KNOWN_META_KEYS.has(key)) return false;
        if (RAW_PAYLOAD_KEY_HINT.test(key)) return false;
        if (value === null || value === undefined || value === '') return false;
        return true;
      })
    : [];
  const instagramUsername =
    typeof meta?.instagram_username === 'string' && meta.instagram_username ? meta.instagram_username : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton
          size="small"
          aria-label="Back to Leads"
          onClick={() => navigate(buildClientPortalPath(activeClientKey, backToLeadsPath))}
          sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '8px' }}
        >
          <Icon icon="hugeicons:arrow-left-01" width={18} height={18} />
        </IconButton>
        <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED }}>Back to Leads</Typography>
      </Stack>

      {isLoading || !lead ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
      ) : (
        <>
        <Box sx={{ ...cardSx, mb: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: TEXT_DARK }}>{lead.name}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mt: 0.5 }}>{lead.phone || '—'}{lead.email ? ` · ${lead.email}` : ''}</Typography>
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
              {lead.source_provider && !isRepliLead && <InfoRow label="Provider" value={lead.source_provider} />}
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

        {isRepliLead && (
          <Box sx={{ ...cardSx, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2 }}>Integration Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
              <Box>
                <InfoRow label="Source" value={lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'} />
                <InfoRow label="Provider" value="Repli" />
              </Box>
              <Box>
                <InfoRow label="Instagram Username" value={instagramUsername ? `@${instagramUsername}` : '—'} />
              </Box>
            </Box>

            {dynamicMetaEntries.length > 0 && (
              <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: CARD_BORDER, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
                <Box>
                  {dynamicMetaEntries
                    .filter((_, index) => index % 2 === 0)
                    .map(([key, value]) => (
                      <InfoRow key={key} label={humanizeKey(key)} value={formatMetaValue(key, value)} />
                    ))}
                </Box>
                <Box>
                  {dynamicMetaEntries
                    .filter((_, index) => index % 2 === 1)
                    .map(([key, value]) => (
                      <InfoRow key={key} label={humanizeKey(key)} value={formatMetaValue(key, value)} />
                    ))}
                </Box>
              </Box>
            )}

          </Box>
        )}

        {collectedEntries.length > 0 && (
          <Box sx={{ ...cardSx, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2 }}>Collected Details</Typography>
            <Stack direction="column" spacing={1.75}>
              {collectedEntries.map(([question, answer]) => (
                <Box key={question} sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED }}>{friendlyQuestionLabel(question)}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK, wordBreak: 'break-word' }}>
                    {answer === null || answer === undefined || answer === '' ? '—' : String(answer)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        </>
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
