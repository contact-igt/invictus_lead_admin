import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Alert, Box, Button, Chip, CircularProgress, Drawer, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { getNamokarOculoplastyLeads, retryNamokarOculoplastySheetSync, updateNamokarOculoplastyLead } from 'services/namokarOculoplastyLead.service';

type Lead = { id: number; name: string; phone: string; doctor?: string; service: string; message?: string; source: string; page_name: string; utm_campaign?: string; lead_status: string; notes?: string; pulseos_status: string; pulseos_error?: string; sheet_sync_status: string; sheet_sync_error?: string; created_at: string; };
const syncColor = (status: string): 'success' | 'warning' | 'error' | 'default' => status === 'synced' ? 'success' : status === 'failed' ? 'error' : status === 'pending' ? 'warning' : 'default';

export default function NamokarOculoplastyLeadsPage() {
  const { clientKey } = useParams<{ clientKey: string }>();
  const { user } = useAuth();
  const isSuperAdmin = String(user?.role || '').toLowerCase() === 'super-admin';
  const client = String(isSuperAdmin ? clientKey : user?.clientKey || '').toLowerCase();
  const scopedClient = isSuperAdmin ? client : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sync, setSync] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const leadsQuery = useQuery(['namokarOculoplastyLeads', client, search, status, sync, page], () => getNamokarOculoplastyLeads({ search, lead_status: status, sheet_sync_status: sync, page, limit: 25 }, scopedClient), { enabled: client === 'namokar', keepPreviousData: true });
  const refresh = () => queryClient.invalidateQueries('namokarOculoplastyLeads');
  const update = useMutation(({ id, data }: { id: number; data: { lead_status?: string; notes?: string } }) => updateNamokarOculoplastyLead(id, data, scopedClient), { onSuccess: () => { refresh(); enqueueSnackbar('Lead updated.', { variant: 'success' }); }, onError: () => { enqueueSnackbar('Unable to update lead.', { variant: 'error' }); } });
  const retry = useMutation((id: number) => retryNamokarOculoplastySheetSync(id, scopedClient), { onSuccess: () => { refresh(); enqueueSnackbar('PulseOS and Google Sheet delivery retried.', { variant: 'success' }); }, onError: () => { enqueueSnackbar('Unable to retry delivery.', { variant: 'error' }); } });
  if (client !== 'namokar') return <Alert severity="warning">Oculoplasty Leads is available only in the Namokar workspace.</Alert>;
  const leads: Lead[] = leadsQuery.data?.data || [];
  const pagination = leadsQuery.data?.pagination;
  const resetPage = () => setPage(1);
  const selectLead = (lead: Lead) => { setSelected(lead); setNotes(lead.notes || ''); };

  return <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
    <Box sx={{ mb: 3 }}><Typography variant="h4" fontWeight={700}>Oculoplasty Leads</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Landing-page submissions stored in the database.</Typography></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(220px, 360px) repeat(2, minmax(160px, 220px))' }, gap: 1.5, mb: 3, alignItems: 'center' }}>
      <TextField size="small" label="Search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} />
      <TextField size="small" select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }}><MenuItem value="">All statuses</MenuItem>{['new', 'contacted', 'qualified', 'closed'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      <TextField size="small" select label="Sheet sync" value={sync} onChange={(event) => { setSync(event.target.value); resetPage(); }}><MenuItem value="">All sync states</MenuItem>{['pending', 'synced', 'failed'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
    </Box>
    <Box sx={{ width: '100%', overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}><Table size="small" sx={{ minWidth: 1080 }}><TableHead><TableRow>{['Name', 'Mobile', 'Service', 'Source / campaign', 'Status', 'PulseOS', 'Sheet', 'Submitted'].map((label) => <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>
      {leadsQuery.isLoading && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>}
      {!leadsQuery.isLoading && leads.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No Oculoplasty leads found.</TableCell></TableRow>}
      {leads.map((lead) => <TableRow hover key={lead.id} onClick={() => selectLead(lead)} sx={{ cursor: 'pointer' }}><TableCell>{lead.name}</TableCell><TableCell>{lead.phone}</TableCell><TableCell>{lead.service}</TableCell><TableCell>{lead.source}{lead.utm_campaign ? ` / ${lead.utm_campaign}` : ''}</TableCell><TableCell><Chip size="small" label={lead.lead_status} /></TableCell><TableCell><Chip size="small" label={lead.pulseos_status} color={syncColor(lead.pulseos_status)} /></TableCell><TableCell><Chip size="small" label={lead.sheet_sync_status} color={syncColor(lead.sheet_sync_status)} /></TableCell><TableCell>{new Date(lead.created_at).toLocaleString('en-IN')}</TableCell></TableRow>)}
    </TableBody></Table></Box>
    {leadsQuery.isError && <Alert severity="error" sx={{ mt: 2 }}>Unable to load Oculoplasty leads.</Alert>}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}><Typography color="text.secondary">{pagination?.total || 0} leads</Typography><Stack direction="row" spacing={1}><Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button disabled={!pagination || page * 25 >= pagination.total} onClick={() => setPage(page + 1)}>Next</Button></Stack></Box>
    <Drawer
      anchor="right"
      open={Boolean(selected)}
      onClose={() => setSelected(null)}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100vw', boxSizing: 'border-box' } }}
    >
      <Box sx={{ height: '100%', boxSizing: 'border-box', overflowY: 'auto', overflowX: 'hidden', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>{selected?.name}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{selected?.phone}</Typography>
          </Box>
          <Button size="small" onClick={() => setSelected(null)}>Close</Button>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, py: 2 }}>
          {[
            ['Doctor', selected?.doctor || 'Not selected'],
            ['Service', selected?.service],
            ['Form', selected?.page_name],
            ['Message', selected?.message || '—'],
            ['PulseOS', `${selected?.pulseos_status || 'pending'}${selected?.pulseos_error ? ` — ${selected.pulseos_error}` : ''}`],
            ['Google Sheet', `${selected?.sheet_sync_status || 'pending'}${selected?.sheet_sync_error ? ` — ${selected.sheet_sync_error}` : ''}`],
          ].map(([label, value]) => <Box key={label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
            <Typography sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>{value}</Typography>
          </Box>)}
        </Box>

        <TextField fullWidth select label="Lead status" value={selected?.lead_status || 'new'} onChange={(event) => selected && update.mutate({ id: selected.id, data: { lead_status: event.target.value } })}>
          {['new', 'contacted', 'qualified', 'closed'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField fullWidth multiline minRows={5} label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} sx={{ mt: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={2}>
          <Button variant="contained" onClick={() => selected && update.mutate({ id: selected.id, data: { notes } })}>Save notes</Button>
          {(selected?.pulseos_status === 'failed' || selected?.sheet_sync_status === 'failed') && <Button onClick={() => selected && retry.mutate(selected.id)} disabled={retry.isLoading}>Retry delivery</Button>}
        </Stack>
      </Box>
    </Drawer>
  </Box>;
}
