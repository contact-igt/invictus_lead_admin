import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useCrmCallsQuery } from 'components/hooks/useCrmQuery';
import { buildClientPortalPath } from 'routes/paths';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const DIRECTION_LABELS: Record<string, string> = { inbound: 'Inbound', outbound: 'Outbound' };

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  completed: { bg: 'rgba(41,175,129,0.12)', fg: GREEN },
  missed: { bg: 'var(--bw-tint-red)', fg: '#EF4444' },
  failed: { bg: 'var(--bw-tint-red)', fg: '#EF4444' },
  no_answer: { bg: 'var(--bw-tint-amber)', fg: '#F59E0B' },
  busy: { bg: 'var(--bw-tint-amber)', fg: '#F59E0B' },
  in_progress: { bg: 'var(--bw-tint-blue)', fg: '#3B82F6' },
};

const formatDuration = (seconds: number | null) => {
  if (!seconds && seconds !== 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const CallsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const provider = searchParams.get('provider') || '';
  const direction = searchParams.get('direction') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const params = useMemo(
    () => ({ provider: provider || undefined, direction: direction || undefined, limit: 50 }),
    [provider, direction],
  );

  const { data, isLoading } = useCrmCallsQuery(scopedClientKey, params, { enabled: hasScope });
  const calls = data?.data ?? [];

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Calls" subtitle="Call logs and recordings across every connected provider" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5}>
        <Select size="small" displayEmpty value={direction} onChange={(e) => updateParam('direction', e.target.value)} sx={{ minWidth: 0, width: { xs: '100%', sm: 160 } }}>
          <MenuItem value="">All Directions</MenuItem>
          <MenuItem value="inbound">Inbound</MenuItem>
          <MenuItem value="outbound">Outbound</MenuItem>
        </Select>
        <Select size="small" displayEmpty value={provider} onChange={(e) => updateParam('provider', e.target.value)} sx={{ minWidth: 0, width: { xs: '100%', sm: 160 } }}>
          <MenuItem value="">All Providers</MenuItem>
          <MenuItem value="runo">Runo</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </Select>
      </Stack>

      <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
          </Box>
        ) : calls.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED }}>No calls logged yet.</Typography>
          </Box>
        ) : (
          calls.map((call, index) => {
            const statusColor = (call.status && STATUS_COLORS[call.status]) || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
            const clickable = Boolean(call.lead);
            return (
              <Stack
                key={call.id}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 1, sm: 2 }}
                onClick={() => clickable && call.lead && navigate(buildClientPortalPath(activeClientKey, `leads/${call.lead.id}`))}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable && call.lead ? `Open ${call.lead.name}` : undefined}
                onKeyDown={(e) => {
                  if (clickable && call.lead && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    navigate(buildClientPortalPath(activeClientKey, `leads/${call.lead.id}`));
                  }
                }}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderTop: index === 0 ? 'none' : '1px solid',
                  borderColor: CARD_BORDER,
                  cursor: clickable ? 'pointer' : 'default',
                  '&:hover': clickable ? { bgcolor: 'var(--bw-hover)' } : undefined,
                  '&:focus-visible': clickable ? { outline: '2px solid #29AF81', outlineOffset: -2 } : undefined,
                }}
              >
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: 'rgba(41,175,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon icon={call.direction === 'outbound' ? 'hugeicons:call-outgoing-02' : 'hugeicons:call-incoming-02'} width={16} height={16} color={GREEN} />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>
                    {call.lead?.name || call.phone_number || 'Unknown caller'}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>
                    {call.phone_number || '—'} · {DIRECTION_LABELS[call.direction || ''] || 'Unknown'} · {call.provider}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED, whiteSpace: 'nowrap' }}>{formatDateTime(call.started_at)}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED, whiteSpace: 'nowrap' }}>{formatDuration(call.duration_seconds)}</Typography>
                  <Chip
                    label={(call.status || 'unknown').replace(/_/g, ' ')}
                    size="small"
                    sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700, fontSize: '0.68rem', height: 22, textTransform: 'capitalize' }}
                  />
                  {call.recording_url && (
                    <Box
                      component="a"
                      href={call.recording_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Play recording"
                      sx={{ display: 'flex', alignItems: 'center', color: GREEN, '&:hover': { color: '#218D68' } }}
                    >
                      <Icon icon="hugeicons:play-circle" width={20} height={20} />
                    </Box>
                  )}
                </Stack>
              </Stack>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default CallsPage;
