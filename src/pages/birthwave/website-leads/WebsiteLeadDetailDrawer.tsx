import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { BirthwaveWebsiteLead } from 'services/birthwave';
import {
  useUpdateBirthwaveWebsiteLeadMutation,
  usePromoteBirthwaveWebsiteLeadMutation,
} from 'components/hooks/useBirthwaveQuery';
import {
  WEBSITE_LEAD_STATUS_COLORS,
  WEBSITE_LEAD_STATUS_LABELS,
  WEBSITE_SOURCE_LABELS,
} from '../constants';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const fmt = (value: string | null) =>
  value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="baseline"
    spacing={2}
    sx={{ py: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }}
  >
    <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, flexShrink: 0 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT_DARK, textAlign: 'right', wordBreak: 'break-word', minWidth: 0 }}>
      {value || '—'}
    </Typography>
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

  const { mutate: update, isLoading: saving } = useUpdateBirthwaveWebsiteLeadMutation(clientKey);
  const { mutate: promote, isLoading: promoting } = usePromoteBirthwaveWebsiteLeadMutation(clientKey);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.notes ?? '');
    }
  }, [lead]);

  if (!lead) return null;

  const statusColor = WEBSITE_LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
  const dirty = status !== lead.status || (notes ?? '') !== (lead.notes ?? '');

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>{lead.name}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {WEBSITE_SOURCE_LABELS[lead.source_key] || lead.source_key}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close enquiry drawer">
          <Icon icon="mdi:close" width={22} height={22} />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 3 }}>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" rowGap={1}>
          <Chip label={WEBSITE_LEAD_STATUS_LABELS[lead.status] || lead.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700 }} />
          {lead.birthwave_lead_id && (
            <Chip label={`CRM Lead #${lead.birthwave_lead_id}`} size="small" sx={{ bgcolor: 'rgba(41,175,129,0.12)', color: GREEN, fontWeight: 700 }} />
          )}
        </Stack>

        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, mb: 0.5 }}>Contact</Typography>
        <Row label="Phone" value={lead.phone} />
        <Row label="Email" value={lead.email} />
        <Row
          label={lead.source_key === 'birthwave_website' ? 'What do you need help with?' : 'Service'}
          value={lead.service}
        />
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

        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_DARK, mb: 1 }}>Manage</Typography>
        <Stack direction="column" spacing={2}>
          <Select size="small" fullWidth value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(WEBSITE_LEAD_STATUS_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={3}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Stack>
      </Box>

      <Divider />
      <Stack direction="row" spacing={1.5} justifyContent="space-between" sx={{ px: 3, py: 2.25 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={promoting || Boolean(lead.birthwave_lead_id)}
          onClick={() => promote(lead.id)}
          startIcon={<Icon icon="mdi:account-arrow-right" width={16} height={16} />}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {lead.birthwave_lead_id ? 'Promoted' : promoting ? 'Promoting…' : 'Promote to CRM'}
        </Button>
        <Button
          variant="contained"
          disabled={saving || !dirty}
          onClick={() => update({ id: lead.id, data: { status, notes: notes.trim() || null } })}
          sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Stack>
    </Drawer>
  );
};

export default WebsiteLeadDetailDrawer;
