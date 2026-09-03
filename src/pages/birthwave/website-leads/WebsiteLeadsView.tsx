import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import ActionMenu from 'components/sections/ActionMenu';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveWebsiteLeadsQuery,
  useDeleteBirthwaveWebsiteLeadMutation,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveWebsiteLead, BirthwaveWebsiteSourceKey } from 'services/birthwave';
import {
  WEBSITE_LEAD_STATUS_COLORS,
  WEBSITE_LEAD_STATUS_LABELS,
  WEBSITE_SOURCE_LABELS,
} from '../constants';
import WebsiteLeadDetailDrawer from './WebsiteLeadDetailDrawer';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

const fmtDate = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const cellSx = {
  py: 1.25,
  px: 2,
  borderBottom: '1px solid',
  borderColor: CARD_BORDER,
  fontSize: '0.8rem',
  color: TEXT_DARK,
  whiteSpace: 'nowrap',
} as const;

const WebsiteLeadsView = ({ sourceKey }: { sourceKey: BirthwaveWebsiteSourceKey }) => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<BirthwaveWebsiteLead | null>(null);
  const [toDelete, setToDelete] = useState<BirthwaveWebsiteLead | null>(null);

  const search = searchParams.get('wsearch') || '';
  const status = searchParams.get('wstatus') || '';

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const params = useMemo(
    () => ({
      source_key: sourceKey,
      search: search || undefined,
      status: status || undefined,
      limit: 100,
    }),
    [sourceKey, search, status],
  );

  const { data, isLoading } = useBirthwaveWebsiteLeadsQuery(scopedClientKey, params, { enabled: hasScope });
  const leads = data?.data ?? [];

  const { mutate: deleteLead, isLoading: deleting } = useDeleteBirthwaveWebsiteLeadMutation(scopedClientKey);

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteLead(toDelete.id, {
      onSuccess: () => {
        if (selected?.id === toDelete.id) setSelected(null);
        setToDelete(null);
      },
    });
  };

  if (!hasScope) {
    return <Typography sx={{ color: TEXT_MUTED }}>Please select a client.</Typography>;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5} flexWrap="wrap" rowGap={1.5}>
        <TextField
          size="small"
          placeholder="Search name, phone, campaign…"
          value={search}
          onChange={(e) => setParam('wsearch', e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <Select size="small" displayEmpty value={status} onChange={(e) => setParam('wstatus', e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(WEBSITE_LEAD_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
      </Stack>

      <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading…</Typography>
          </Box>
        ) : leads.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED }}>
              No enquiries yet for {WEBSITE_SOURCE_LABELS[sourceKey] || sourceKey}.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <Box component="thead">
                <Box component="tr">
                  {['Name', 'Phone', sourceKey === 'birthwave_website' ? 'Needs help with' : 'Service', 'Source / Campaign', 'Status', 'Submitted', 'Actions'].map((col) => (
                    <Box
                      component="th"
                      key={col}
                      sx={{
                        textAlign: col === 'Actions' ? 'center' : 'left',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: TEXT_MUTED,
                        borderBottom: '1px solid',
                        borderColor: CARD_BORDER,
                        py: 1.25,
                        px: 2,
                      }}
                    >
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {leads.map((lead) => {
                  const sc = WEBSITE_LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
                  return (
                    <Box
                      component="tr"
                      key={lead.id}
                      sx={{ '&:hover td': { bgcolor: 'var(--bw-hover)' } }}
                    >
                      <Box component="td" sx={{ ...cellSx, fontSize: '0.82rem', fontWeight: 600 }}>{lead.name}</Box>
                      <Box component="td" sx={cellSx}>{lead.phone}</Box>
                      <Box component="td" sx={cellSx}>{lead.service || '—'}</Box>
                      <Box component="td" sx={cellSx}>
                        {[lead.source, lead.campaign].filter(Boolean).join(' · ') || '—'}
                      </Box>
                      <Box component="td" sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                        <Chip label={WEBSITE_LEAD_STATUS_LABELS[lead.status] || lead.status} size="small" sx={{ bgcolor: sc.bg, color: sc.fg, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                      </Box>
                      <Box component="td" sx={{ ...cellSx, color: TEXT_MUTED }}>{fmtDate(lead.created_at)}</Box>
                      <Box
                        component="td"
                        sx={{
                          ...cellSx,
                          textAlign: 'center',
                          '& button': { padding: '4px' },
                          '& button svg': { fontSize: 17 },
                        }}
                      >
                        <ActionMenu
                          onView={() => setSelected(lead)}
                          onRemove={() => setToDelete(lead)}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <WebsiteLeadDetailDrawer
        clientKey={scopedClientKey}
        lead={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />

      <Dialog
        open={Boolean(toDelete)}
        onClose={deleting ? undefined : () => setToDelete(null)}
        maxWidth="xs"
        fullWidth
        BackdropProps={{ sx: { bgcolor: 'rgba(0, 0, 0, 0.62)', backdropFilter: 'blur(3px)' } }}
        PaperProps={{
          sx: {
            m: 2,
            bgcolor: 'var(--bw-surface)',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: CARD_BORDER,
            borderRadius: '20px',
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.38)',
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '14px',
              bgcolor: 'var(--bw-tint-red)',
              color: '#EF4444',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon icon="mdi:trash-can-outline" width={23} height={23} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ color: TEXT_DARK, fontSize: '1.08rem', fontWeight: 750, lineHeight: 1.3 }}>
              Delete enquiry?
            </Typography>
            <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem', mt: 0.35 }}>
              Permanently remove this record
            </Typography>
          </Box>
          <IconButton
            aria-label="Close delete confirmation"
            onClick={() => setToDelete(null)}
            disabled={deleting}
            size="small"
            sx={{ color: TEXT_MUTED, alignSelf: 'flex-start' }}
          >
            <Icon icon="mdi:close" width={20} height={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: '12px !important', pb: 2.5 }}>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.88rem', lineHeight: 1.65 }}>
            You are about to permanently delete the following enquiry from the CRM.
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'var(--bw-surface-2)',
              border: '1px solid',
              borderColor: CARD_BORDER,
              borderRadius: '12px',
            }}
          >
            <Typography sx={{ color: TEXT_DARK, fontSize: '0.92rem', fontWeight: 700 }}>
              {toDelete?.name || 'Unnamed enquiry'}
            </Typography>
            {toDelete?.phone && (
              <Stack direction="row" spacing={0.75} alignItems="center" mt={0.5}>
                <Icon icon="mdi:phone-outline" width={15} height={15} color={TEXT_MUTED} />
                <Typography sx={{ color: TEXT_MUTED, fontSize: '0.8rem' }}>{toDelete.phone}</Typography>
              </Stack>
            )}
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center" mt={1.75}>
            <Icon icon="mdi:alert-circle-outline" width={17} height={17} color="#EF4444" />
            <Typography sx={{ color: '#EF4444', fontSize: '0.78rem', fontWeight: 650 }}>
              This action cannot be undone.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.25, borderTop: '1px solid', borderColor: CARD_BORDER, gap: 1 }}>
          <Button
            onClick={() => setToDelete(null)}
            variant="outlined"
            disabled={deleting}
            sx={{
              color: TEXT_DARK,
              bgcolor: 'var(--bw-surface-2)',
              borderColor: CARD_BORDER,
              borderRadius: '10px',
              minWidth: 104,
              height: 42,
              '&:hover': { bgcolor: 'var(--bw-hover)', borderColor: TEXT_MUTED },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ borderRadius: '10px', minWidth: 112, height: 42, boxShadow: '0 8px 20px rgba(239, 68, 68, 0.22)' }}
            startIcon={<Icon icon="mdi:trash-can-outline" width={16} height={16} />}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebsiteLeadsView;
