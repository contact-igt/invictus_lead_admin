import { useEffect, useState } from 'react';
import { Alert, Button, Chip, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { BirthwaveWebsiteLead } from 'services/birthwave';
import {
  usePromoteBirthwaveWebsiteLeadMutation,
  useRetryBirthwaveWebsiteLeadSheetSyncMutation,
  useUpdateBirthwaveWebsiteLeadMutation,
} from 'components/hooks/useBirthwaveQuery';
import { WEBSITE_LEAD_STATUS_COLORS, WEBSITE_LEAD_STATUS_LABELS, WEBSITE_SOURCE_LABELS } from '../constants';
import BirthwaveDrawerLayout from '../BirthwaveDrawerLayout';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const SHEET_SYNC_COLORS: Record<string, { bg: string; fg: string }> = {
  synced:  { bg: 'rgba(41,175,129,0.12)', fg: '#29AF81' },
  pending: { bg: 'rgba(245,158,11,0.12)', fg: '#D97706' },
  syncing: { bg: 'rgba(59,130,246,0.12)', fg: '#2563EB' },
  failed:  { bg: 'rgba(239,68,68,0.12)',  fg: '#EF4444' },
};

const fmt = (value: string | null) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'baseline' }} spacing={{ xs: 0.35, sm: 2 }} sx={{ py: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, flexShrink: 0 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT_DARK, textAlign: { xs: 'left', sm: 'right' }, wordBreak: 'break-word', minWidth: 0 }}>{value || '—'}</Typography>
  </Stack>
);

interface Props {
  clientKey: string | undefined;
  lead: BirthwaveWebsiteLead | null;
  open: boolean;
  onClose: () => void;
}

const WebsiteLeadDetailDrawer = ({ clientKey, lead, open, onClose }: Props) => {
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const updateMutation = useUpdateBirthwaveWebsiteLeadMutation(clientKey);
  const promoteMutation = usePromoteBirthwaveWebsiteLeadMutation(clientKey);
  const retrySheetSyncMutation = useRetryBirthwaveWebsiteLeadSheetSyncMutation(clientKey);
  const { mutate: update, isLoading: saving } = updateMutation;
  const { mutate: promote, isLoading: promoting } = promoteMutation;
  const { mutate: retrySheetSync, isLoading: retrying } = retrySheetSyncMutation;

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.notes ?? '');
    }
  }, [lead]);

  if (!lead) return null;
  const statusColor = WEBSITE_LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
  const dirty = status !== lead.status || notes !== (lead.notes ?? '');
  const mutationError = (updateMutation.error || promoteMutation.error) as { response?: { data?: { message?: string } } } | null;
  const sheetSyncColor = SHEET_SYNC_COLORS[lead.sheet_sync_status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
  const sheetSyncFailed = lead.sheet_sync_status === 'failed' || (lead.sheet_sync_status === 'pending' && lead.sheet_sync_attempts > 0);

  return (
    <BirthwaveDrawerLayout
      open={open}
      onClose={onClose}
      title={lead.name}
      subtitle={WEBSITE_SOURCE_LABELS[lead.source_key] || lead.source_key}
      width={480}
      footer={<>
        <Button variant="outlined" color="inherit" disabled={promoting || Boolean(lead.birthwave_lead_id)} onClick={() => promote(lead.id)} sx={{ textTransform: 'none', fontWeight: 700 }}>
          {lead.birthwave_lead_id ? 'Promoted' : promoting ? 'Promoting...' : 'Promote to CRM'}
        </Button>
        <Button variant="contained" disabled={saving || !dirty} onClick={() => update({ id: lead.id, data: { status, notes: notes.trim() || null } })} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </>}
    >
      {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError.response?.data?.message || 'Unable to update this enquiry.'}</Alert>}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" rowGap={1}>
        <Chip label={WEBSITE_LEAD_STATUS_LABELS[lead.status] || lead.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700 }} />
        {lead.birthwave_lead_id && <Chip label={`CRM Lead #${lead.birthwave_lead_id}`} size="small" sx={{ bgcolor: 'rgba(41,175,129,0.12)', color: GREEN, fontWeight: 700 }} />}
        {/* Sheet sync status badge */}
        <Tooltip title={lead.sheet_sync_last_error || (lead.sheet_sync_status === 'synced' ? `Synced to sheet on ${fmt(lead.sheet_synced_at)}` : `Attempts: ${lead.sheet_sync_attempts}`)}>
          <Chip
            icon={<Icon icon={lead.sheet_sync_status === 'synced' ? 'mdi:google-spreadsheet' : lead.sheet_sync_status === 'failed' ? 'mdi:cloud-alert' : 'mdi:cloud-sync'} width={13} />}
            label={`Sheet: ${lead.sheet_sync_status ?? 'unknown'}`}
            size="small"
            sx={{ bgcolor: sheetSyncColor.bg, color: sheetSyncColor.fg, fontWeight: 700, fontSize: '0.65rem' }}
          />
        </Tooltip>
        {sheetSyncFailed && (
          <Button
            size="small"
            variant="outlined"
            disabled={retrying}
            onClick={() => retrySheetSync(lead.id)}
            startIcon={<Icon icon="mdi:refresh" width={14} />}
            sx={{ fontSize: '0.7rem', height: 24, px: 1, borderColor: '#EF4444', color: '#EF4444', '&:hover': { borderColor: '#DC2626', bgcolor: 'rgba(239,68,68,0.06)' } }}
          >
            {retrying ? 'Retrying…' : 'Retry Sheet Sync'}
          </Button>
        )}
      </Stack>

      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, mb: 0.5 }}>Contact</Typography>
      <Row label="Phone" value={lead.phone} />
      <Row label="Email" value={lead.email} />
      <Row label={lead.source_key === 'birthwave_website' ? 'What do you need help with?' : 'Service'} value={lead.service} />
      {lead.source_key === 'birthwave_workshop' && <>
        <Row label="Registration status" value={lead.message?.match(/^Registration status:[ \t]*([^\r\n]+)/im)?.[1]} />
        <Row label="Pregnancy stage" value={lead.message?.match(/^Pregnancy stage:[ \t]*([^\r\n]+)/im)?.[1]} />
        <Row label="Workshop date" value={lead.message?.match(/^Workshop session:[ \t]*([^\r\n]+)/im)?.[1]} />
      </>}
      <Row label="Message" value={lead.message} />
      <Row label="Submitted" value={fmt(lead.created_at)} />

      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, mt: 2.5, mb: 0.5 }}>Attribution</Typography>
      <Row label="Source" value={lead.source} />
      <Row label="Campaign" value={lead.campaign} />
      <Row label="Creative" value={lead.creative} />
      <Row label="UTM source" value={lead.utm_source} />
      <Row label="UTM medium" value={lead.utm_medium} />
      <Row label="UTM campaign" value={lead.utm_campaign} />
      <Row label="UTM content" value={lead.utm_content} />
      <Row label="UTM term" value={lead.utm_term} />
      <Row label="gclid" value={lead.gclid} />
      <Row label="fbclid" value={lead.fbclid} />
      <Row label="IP address" value={lead.ip_address} />

      <Divider sx={{ my: 2.5 }} />
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, mb: 1 }}>Manage enquiry</Typography>
      <Stack spacing={2}>
        <FormControl size="small" fullWidth>
          <InputLabel id="website-lead-status-label">Status</InputLabel>
          <Select labelId="website-lead-status-label" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {Object.entries(WEBSITE_LEAD_STATUS_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" fullWidth multiline minRows={4} label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </Stack>
    </BirthwaveDrawerLayout>
  );
};

export default WebsiteLeadDetailDrawer;
