import { useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Pagination, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveAttentionQuery, useAcknowledgeBirthwaveAttentionMutation, useDismissBirthwaveAttentionMutation, useReconcileBirthwaveAttentionMutation, useResolveBirthwaveAttentionMutation } from 'components/hooks/useBirthwaveQuery';
import { buildClientPortalPath } from 'routes/paths';
import { cardSx, GREEN, TEXT_DARK, TEXT_MUTED } from '../dashboard/ui';
import { BirthwaveAttention } from 'services/birthwave';

const AttentionPage = () => {
  const { activeClientKey, scopedClientKey, hasScope } = useBirthwaveScope();
  const navigate = useNavigate(); const [status, setStatus] = useState(''); const [type, setType] = useState(''); const [severity, setSeverity] = useState('');
  // BW-UI-010: the list is server-paginated at 25 rows and the page previously
  // rendered only the first page with no control, so every exception past the
  // 25th was silently unreachable. Any filter change resets back to page 1.
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ ...(status ? { status } : {}), ...(type ? { attention_type: type } : {}), ...(severity ? { severity } : {}), page }), [status, type, severity, page]);
  const setFilter = (apply: () => void) => { apply(); setPage(1); };
  const query = useBirthwaveAttentionQuery(scopedClientKey, params, { enabled: hasScope });
  const acknowledge = useAcknowledgeBirthwaveAttentionMutation(scopedClientKey); const resolve = useResolveBirthwaveAttentionMutation(scopedClientKey); const dismiss = useDismissBirthwaveAttentionMutation(scopedClientKey); const reconcile = useReconcileBirthwaveAttentionMutation(scopedClientKey);
  if (!hasScope) return <Box sx={{ p: 4 }}><Typography color="text.secondary">Please select a client.</Typography></Box>;
  const items = query.data?.data || [];
  const openLead = (item: BirthwaveAttention) => item.lead_id && navigate(buildClientPortalPath(activeClientKey, `leads/${item.lead_id}`));
  const types = ['UNASSIGNED_LEAD', 'ASSIGNMENT_FAILED', 'ROUTING_FAILED', 'MISSING_OWNER', 'MISSING_NEXT_ACTION', 'TASK_OVERDUE', 'FOLLOW_UP_OVERDUE'];
  return <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={3}><Box><Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: TEXT_DARK }}>Needs Attention</Typography><Typography sx={{ color: TEXT_MUTED, mt: 0.5 }}>Exceptions requiring manager or administrator action.</Typography></Box><Button variant="contained" onClick={() => reconcile.mutate()} disabled={reconcile.isLoading} startIcon={<Icon icon="hugeicons:refresh" />} sx={{ bgcolor: GREEN, textTransform: 'none', boxShadow: 'none' }}>Reconcile now</Button></Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2}><Select size="small" displayEmpty value={status} onChange={(e) => setFilter(() => setStatus(e.target.value))} sx={{ minWidth: 150 }}><MenuItem value="">Open & acknowledged</MenuItem><MenuItem value="OPEN">Open</MenuItem><MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem><MenuItem value="RESOLVED">Resolved</MenuItem><MenuItem value="DISMISSED">Dismissed</MenuItem></Select><Select size="small" displayEmpty value={severity} onChange={(e) => setFilter(() => setSeverity(e.target.value))} sx={{ minWidth: 130 }}><MenuItem value="">All severity</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="NORMAL">Normal</MenuItem></Select><Select size="small" displayEmpty value={type} onChange={(e) => setFilter(() => setType(e.target.value))} sx={{ minWidth: 210 }}><MenuItem value="">All problems</MenuItem>{types.map((value) => <MenuItem key={value} value={value}>{value.replace(/_/g, ' ')}</MenuItem>)}</Select></Stack>
    <Box sx={{ ...cardSx, overflowX: 'auto' }}>{query.isError ? <Typography color="error" sx={{ p: 2 }}>Unable to load Needs Attention. Your role may not have management access.</Typography> : <Table size="small"><TableHead><TableRow>{['Problem', 'Lead', 'Team / Owner', 'Detected', 'Age', 'Severity', 'Status', 'Actions'].map((heading) => <TableCell key={heading} sx={{ fontWeight: 800, color: TEXT_MUTED }}>{heading}</TableCell>)}</TableRow></TableHead><TableBody>{items.map((item) => <TableRow key={item.id} hover><TableCell><Typography sx={{ fontWeight: 700, color: TEXT_DARK }}>{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.attention_type.replace(/_/g, ' ')}</Typography></TableCell><TableCell><Button size="small" onClick={() => openLead(item)} sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>{item.lead?.name || `Lead #${item.lead_id || '—'}`}</Button></TableCell><TableCell><Typography variant="body2">{item.team?.name || 'Unassigned'}</Typography><Typography variant="caption" color="text.secondary">{item.owner?.username || 'No owner'}</Typography></TableCell><TableCell>{new Date(item.detected_at).toLocaleString()}</TableCell><TableCell>{item.age_minutes}m</TableCell><TableCell><Chip size="small" label={item.severity} color={item.severity === 'HIGH' ? 'error' : 'default'} /></TableCell><TableCell><Chip size="small" label={item.status} /></TableCell><TableCell><Stack direction="row" spacing={0.5}>{item.status === 'OPEN' && <Button size="small" onClick={() => acknowledge.mutate(item.id)} sx={{ textTransform: 'none' }}>Acknowledge</Button>}{['OPEN', 'ACKNOWLEDGED'].includes(item.status) && <><Button size="small" onClick={() => resolve.mutate({ id: item.id, resolution_note: 'Resolved from Needs Attention' })} sx={{ textTransform: 'none', color: GREEN }}>Resolve</Button><Button size="small" onClick={() => dismiss.mutate({ id: item.id, resolution_note: 'Dismissed from Needs Attention' })} sx={{ textTransform: 'none' }}>Dismiss</Button></>}</Stack></TableCell></TableRow>)}{!query.isLoading && items.length === 0 && <TableRow><TableCell colSpan={8}><Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">No attention items match these filters.</Typography></TableCell></TableRow>}</TableBody></Table>}</Box>
    {(query.data?.pagination?.totalPages ?? 1) > 1 && (
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>
          {query.data?.pagination.total} exception{query.data?.pagination.total === 1 ? '' : 's'} · page {query.data?.pagination.page} of {query.data?.pagination.totalPages}
        </Typography>
        <Pagination
          page={page}
          count={query.data?.pagination.totalPages || 1}
          onChange={(_, value) => setPage(value)}
          siblingCount={0}
          size="small"
        />
      </Stack>
    )}
  </Box>;
};
export default AttentionPage;
