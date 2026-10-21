import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { getNamokarWebsiteLeads, retryNamokarWebsiteLeadDelivery } from 'services/namokarWebsiteLead.service';
import type { NamokarWebsiteLead } from 'types/namokarWebsiteLead';

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => status === 'synced' ? 'success' : status === 'failed' ? 'error' : status === 'pending' ? 'warning' : 'default';
const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const NamokarWebsiteLeadsPage = () => {
  const { clientKey } = useParams<{ clientKey: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const isSuperAdmin = String(user?.role || '').toLowerCase() === 'super-admin';
  const activeClientKey = String(isSuperAdmin ? clientKey : user?.clientKey || '').toLowerCase();
  const hasScope = activeClientKey === 'namokar';
  const query = useQuery(['namokarWebsiteLeads', activeClientKey], () => getNamokarWebsiteLeads(isSuperAdmin ? activeClientKey : undefined), { enabled: hasScope, staleTime: 60_000, refetchOnWindowFocus: false });
  const retry = useMutation((id: number) => retryNamokarWebsiteLeadDelivery(id, isSuperAdmin ? activeClientKey : undefined), {
    onSuccess: () => {
      queryClient.invalidateQueries(['namokarWebsiteLeads', activeClientKey]);
      enqueueSnackbar('Delivery retried.', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Unable to retry delivery.', { variant: 'error' });
    },
  });
  const leads = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const rows = query.data?.data || [];
    return searchText ? rows.filter((lead: NamokarWebsiteLead) => [lead.name, lead.phone, lead.service, lead.message, lead.form_id].some((value) => String(value || '').toLowerCase().includes(searchText))) : rows;
  }, [query.data?.data, search]);

  if (!hasScope) return <Alert severity="warning">Namokar Website Leads is available only in the Namokar client workspace.</Alert>;

  return (
    <Stack spacing={2.5} p={3.5} width="100%">
      <Box><Typography variant="h4" fontWeight={700}>Namokar Website Leads</Typography><Typography color="text.secondary" mt={0.5}>Contact and home-popup enquiries submitted through the Namokar website.</Typography></Box>
      <TextField size="small" label="Search leads" placeholder="Name, phone, treatment, form" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ maxWidth: 380 }} />
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: 1100 }}>
          <TableHead><TableRow>{['Name', 'Mobile', 'Treatment', 'Message', 'Form', 'PulseOS', 'Google Sheet', 'Submitted', ''].map((label, index) => <TableCell key={`${label}-${index}`} sx={{ fontWeight: 700 }}>{label}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {query.isLoading && <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell></TableRow>}
            {query.isError && <TableRow><TableCell colSpan={9}><Alert severity="error">Unable to load Namokar website leads.</Alert></TableCell></TableRow>}
            {!query.isLoading && !query.isError && leads.length === 0 && <TableRow><TableCell colSpan={9} align="center">No website leads found.</TableCell></TableRow>}
            {leads.map((lead) => <TableRow key={lead.id} hover><TableCell>{lead.name}</TableCell><TableCell>{lead.phone}</TableCell><TableCell>{lead.service}</TableCell><TableCell sx={{ maxWidth: 260 }}>{lead.message || '—'}</TableCell><TableCell>{lead.form_id}</TableCell><TableCell><Chip size="small" label={lead.pulseos_status} color={statusColor(lead.pulseos_status)} /></TableCell><TableCell><Chip size="small" label={lead.sheet_sync_status} color={statusColor(lead.sheet_sync_status)} /></TableCell><TableCell>{formatDate(lead.created_at)}</TableCell><TableCell>{(lead.pulseos_status !== 'synced' || lead.sheet_sync_status !== 'synced') && <Button size="small" disabled={retry.isLoading} onClick={() => retry.mutate(lead.id)}>Retry</Button>}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default NamokarWebsiteLeadsPage;
