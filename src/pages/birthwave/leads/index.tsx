import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Pagination, Select, Stack, TextField, Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveDoctorsQuery, useBirthwaveLeadsQuery, useBirthwaveTeamsQuery, useSyncRepliLeadsMutation,
  useBirthwaveTeamContextQuery, useBirthwaveTeamQuery, useBulkAssignBirthwaveLeadsMutation, useBirthwaveServicesQuery,
} from 'components/hooks/useBirthwaveQuery';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import { BirthwaveLead } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, WEBSITE_SOURCE_LABELS } from '../constants';
import PortalPageHeader from '../PortalPageHeader';
import LeadFormDrawer from '../LeadFormDrawer';
import CrmFieldFilterControl from '../crm/CrmFieldFilterControl';
import { formatCrmFieldValue } from '../crm/formatCrmFieldValue';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';


const LeadsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<BirthwaveLead | null>(null);
  const { user } = useAuth();
  const sync = useSyncRepliLeadsMutation();
  const canSync = ['super-admin', 'admin'].includes((user?.role || '').toLowerCase()) && activeClientKey === 'birthwave';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const view = searchParams.get('view') || 'crm';
  // Carry the active view onto the detail route so "Back to Leads" returns to
  // this same filtered list (Instagram Leads / a website source) rather than
  // the default "All Leads".
  const detailQuerySuffix = view !== 'crm' ? `?view=${encodeURIComponent(view)}` : '';
  const isInstagramView = view === 'instagram';
  const isWebsiteView = view !== 'crm' && !isInstagramView;

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const source = searchParams.get('source') || '';
  const serviceId = searchParams.get('service_id') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const cfKey = searchParams.get('cf_key') || '';
  const cfValue = searchParams.get('cf_value') || '';
  const teamId = searchParams.get('team_id') || '';
  const ownerId = searchParams.get('owner_id') || '';
  const assignmentStatus = searchParams.get('assignment_status') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (key !== 'page') params.delete('page');
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const clearFilter = (key: string) => updateParam(key, '');
  const clearRangeFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('from');
    params.delete('to');
    setSearchParams(params, { replace: true });
  };
  const clearCustomFieldFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('cf_key');
    params.delete('cf_value');
    setSearchParams(params, { replace: true });
  };

  const { data: customFields = [] } = useCrmFieldsQuery(scopedClientKey, 'birthwave_lead', { enabled: hasScope });
  const tableFields = customFields.filter((f) => f.show_in_table);
  const filterableFields = customFields.filter((f) => f.filterable);
  const activeFilterField = customFields.find((f) => f.field_key === cfKey);

  // Instagram Leads AND every website/landing-page source are fixed
  // server-side filters over the same birthwave_leads list endpoint — never a
  // client-side subset of "All Leads" (that would break pagination/totals),
  // and never a separate table. The source/source_provider here are forced
  // regardless of any stray `source` query param.
  //
  // BW-FIX-004: the website source views previously rendered
  // <WebsiteLeadsView>, i.e. the deprecated birthwave_website_leads staging
  // table, which gave the portal a second user-facing "lead" concept with its
  // own status vocabulary and a Promote-to-CRM step. Website intake has
  // written birthwave_leads directly since the direct-to-Lead refactor
  // (birthwaveWebsiteLead.service.js: createWebsiteLead stores
  // source_provider = <source_key>), so these views are now the same CRM list
  // filtered by that provider.
  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      source: isInstagramView ? 'instagram' : isWebsiteView ? 'website' : source || undefined,
      service_id: serviceId || undefined,
      source_provider: isInstagramView ? 'REPLI' : isWebsiteView ? view : undefined,
      start_date: from || undefined,
      end_date: to || undefined,
      custom_field_key: cfKey && cfValue !== '' ? cfKey : undefined,
      custom_field_value: cfKey && cfValue !== '' ? cfValue : undefined,
      team_id: teamId || undefined,
      owner_id: ownerId || undefined,
      assignment_status: assignmentStatus || undefined,
      limit: 50,
      page,
    }),
    [search, status, source, serviceId, from, to, cfKey, cfValue, teamId, ownerId, assignmentStatus, isInstagramView, isWebsiteView, view, page],
  );

  const { data, isLoading } = useBirthwaveLeadsQuery(scopedClientKey, params, { enabled: hasScope });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const { data: teams = [] } = useBirthwaveTeamsQuery(scopedClientKey, {}, { enabled: hasScope });
  // All services so an existing filter on a retired service still resolves.
  const { data: services = [] } = useBirthwaveServicesQuery(scopedClientKey, {}, { enabled: hasScope });
  const leads = data?.data ?? [];

  // ── Bulk assignment (Admin / authorized Team Manager only) ──────────────
  const { data: teamContext } = useBirthwaveTeamContextQuery(scopedClientKey, { enabled: hasScope });
  const canBulkAssign = Boolean(
    teamContext?.is_admin ||
      teamContext?.memberships?.some((m) => m.operational_role === 'TEAM_MANAGER' && m.status === 'ACTIVE'),
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTeamId, setBulkTeamId] = useState('');
  const [bulkOwnerId, setBulkOwnerId] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const { data: bulkTeam } = useBirthwaveTeamQuery(scopedClientKey, bulkTeamId || undefined, { enabled: Boolean(bulkTeamId) });
  const bulkAssign = useBulkAssignBirthwaveLeadsMutation(scopedClientKey);
  const selectableIds = leads.map((l) => l.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const toggleOne = (id: number) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  const toggleAll = () =>
    setSelectedIds((current) => (allSelected ? current.filter((id) => !selectableIds.includes(id)) : [...new Set([...current, ...selectableIds])]));
  const submitBulk = () => {
    if (!bulkTeamId || !bulkOwnerId || selectedIds.length === 0) return;
    bulkAssign.mutate(
      { lead_ids: selectedIds, team_id: Number(bulkTeamId), owner_id: Number(bulkOwnerId), reason: bulkReason.trim() || undefined },
      {
        onSuccess: () => {
          setBulkOpen(false);
          setSelectedIds([]);
          setBulkTeamId('');
          setBulkOwnerId('');
          setBulkReason('');
        },
      },
    );
  };

  const activeFilters = [
    status && { key: 'status', label: LEAD_STATUS_LABELS[status] || status },
    // Source is fixed (not a removable filter) on the Instagram Leads view.
    !isInstagramView && source && { key: 'source', label: LEAD_SOURCE_LABELS[source] || source },
    from && to && { key: 'range', label: `${from} → ${to}` },
    cfKey && cfValue !== '' && activeFilterField && {
      key: 'custom',
      label: `${activeFilterField.label}: ${formatCrmFieldValue(activeFilterField, activeFilterField.field_type === 'boolean' ? cfValue === 'true' : cfValue)}`,
    },
    teamId && { key: 'team_id', label: `Team: ${teams.find((team) => String(team.id) === teamId)?.name || teamId}` },
    ownerId && { key: 'owner_id', label: `Owner: ${ownerId}` },
    assignmentStatus && { key: 'assignment_status', label: assignmentStatus === 'ASSIGNED' ? 'Assigned' : 'Unassigned' },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader
        title={
          isInstagramView
            ? `Instagram Leads${data?.pagination?.total ? ` (${data.pagination.total})` : ''}`
            : isWebsiteView
              ? `${WEBSITE_SOURCE_LABELS[view] || 'Leads'}${data?.pagination?.total ? ` (${data.pagination.total})` : ''}`
              : 'Leads'
        }
        subtitle={
          isInstagramView
            ? 'Leads captured from Birthwave Instagram through Repli'
            : isWebsiteView
              ? 'CRM leads captured from this website source'
              : 'Search, filter, and manage every Birthwave lead'
        }
        action={
          isInstagramView ? (canSync ? (
            <Button variant="contained" disabled={sync.isLoading} onClick={() => sync.mutate()}>
              {sync.isLoading ? 'Syncing...' : 'Sync now'}
            </Button>
          ) : undefined) : isWebsiteView ? undefined : (
            <Button
              variant="contained"
              startIcon={<Icon icon="mdi:plus" width={18} height={18} />}
              onClick={() => {
                setEditingLead(null);
                setFormOpen(true);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
            >
              Add Lead
            </Button>
          )
        }
      />

      {isInstagramView && canSync && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Sync now imports a batch of existing Repli leads. New lead events arrive through the webhook.
          {sync.data?.paginationHint && ' Repli returned pagination information; this sync may not include every historical lead.'}
        </Alert>
      )}

      <>
      <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" rowGap={1.5} spacing={1.5} mb={activeFilters.length ? 1.5 : 2.5}>
        <TextField
          size="small"
          placeholder="Search name, phone, service..."
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <Select size="small" displayEmpty value={status} onChange={(e) => updateParam('status', e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
        {/*
          BW-SVC-001: filtering is by service_id, never by display text, so a
          renamed service keeps filtering correctly and every option comes from
          the service master rather than a hardcoded list.
        */}
        <Select size="small" displayEmpty value={serviceId} onChange={(e) => updateParam('service_id', e.target.value)} sx={{ minWidth: 190 }}>
          <MenuItem value="">All Services</MenuItem>
          {services.map((service) => (
            <MenuItem key={service.id} value={String(service.id)}>{service.name}</MenuItem>
          ))}
        </Select>
        {!isInstagramView && !isWebsiteView && (
          <Select size="small" displayEmpty value={source} onChange={(e) => updateParam('source', e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="">All Sources</MenuItem>
            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        )}
        <CrmFieldFilterControl
          fields={filterableFields}
          fieldKey={cfKey}
          value={cfValue}
          onFieldKeyChange={(key) => updateParam('cf_key', key)}
          onValueChange={(value) => updateParam('cf_value', value)}
        />
        <Select size="small" displayEmpty value={teamId} onChange={(e) => updateParam('team_id', e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="">All Teams</MenuItem>
          {teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}
        </Select>
        <TextField size="small" placeholder="Owner ID" value={ownerId} onChange={(e) => updateParam('owner_id', e.target.value.replace(/\D/g, ''))} sx={{ width: 120 }} />
        <Select size="small" displayEmpty value={assignmentStatus} onChange={(e) => updateParam('assignment_status', e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All Assignment</MenuItem>
          <MenuItem value="ASSIGNED">Assigned</MenuItem>
          <MenuItem value="UNASSIGNED">Unassigned</MenuItem>
        </Select>
      </Stack>

      {activeFilters.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} mb={2.5}>
          {activeFilters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onDelete={() => (f.key === 'range' ? clearRangeFilter() : f.key === 'custom' ? clearCustomFieldFilter() : clearFilter(f.key))}
              sx={{ bgcolor: 'rgba(41,175,129,0.1)', color: GREEN, fontWeight: 600 }}
            />
          ))}
        </Stack>
      )}

      {canBulkAssign && selectedIds.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: 'var(--bw-tint-green)', border: '1px solid', borderColor: CARD_BORDER }}
        >
          <Typography sx={{ fontWeight: 700, color: TEXT_DARK, fontSize: '0.85rem', flexGrow: 1 }}>
            {selectedIds.length} lead{selectedIds.length === 1 ? '' : 's'} selected
          </Typography>
          <Button size="small" onClick={() => setSelectedIds([])} sx={{ textTransform: 'none', color: TEXT_MUTED }}>
            Clear
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Icon icon="mdi:account-multiple-plus" width={16} />}
            onClick={() => setBulkOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}
          >
            Bulk Assign
          </Button>
        </Stack>
      )}

      <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
          </Box>
        ) : leads.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_MUTED, fontWeight: isInstagramView ? 700 : 400 }}>
              {isInstagramView ? 'No Instagram leads found.' : 'No leads match these filters.'}
            </Typography>
            {isInstagramView && (
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.8rem', mt: 0.5 }}>
                New Birthwave Instagram leads captured through Repli will appear here automatically.
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
              <Box component="thead">
                <Box component="tr">
                  {canBulkAssign && (
                    <Box component="th" sx={{ width: 44, px: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={!allSelected && selectableIds.some((id) => selectedIds.includes(id))}
                        onChange={toggleAll}
                        inputProps={{ 'aria-label': 'Select all leads on this page' }}
                      />
                    </Box>
                  )}
                  {[
                    'Name',
                    'Phone',
                    ...(isInstagramView ? ['Instagram'] : []),
                    'Service',
                    'Source',
                    'Status',
                    'Team',
                    'Owner',
                    'Assignment',
                    'Assigned Doctor',
                    // BW-UI-004: the "Next Follow-up" column is gone. It rendered
                    // birthwave_leads.next_follow_up, which only the manual Lead
                    // form ever writes — the task engine schedules a FOLLOW_UP
                    // task instead and never touches that column, so the column
                    // showed "—" on every row regardless of real follow-up work.
                    // Live follow-ups are on the Follow-ups page and on Lead
                    // Detail, both of which read birthwave_tasks.
                    ...tableFields.map((f) => f.label),
                    '',
                  ].map((col, index) => (
                    <Box component="th" key={`${col}-${index}`} sx={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_MUTED, borderBottom: '1px solid', borderColor: CARD_BORDER, py: 1.25, px: 2 }}>
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {leads.map((lead) => {
                  const statusColor = LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
                  const instagramUsername =
                    typeof lead.integration_metadata?.instagram_username === 'string'
                      ? lead.integration_metadata.instagram_username
                      : null;
                  return (
                    <Box
                      component="tr"
                      key={lead.id}
                      onClick={() => navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}${detailQuerySuffix}`))}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${lead.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}${detailQuerySuffix}`));
                        }
                      }}
                      sx={{ cursor: 'pointer', '&:hover td': { bgcolor: 'var(--bw-hover)' }, '&:focus-visible': { outline: '2px solid #29AF81', outlineOffset: -2 } }}
                    >
                      {canBulkAssign && (
                        <Box component="td" sx={{ px: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            checked={selectedIds.includes(lead.id)}
                            onChange={() => toggleOne(lead.id)}
                            inputProps={{ 'aria-label': `Select ${lead.name}` }}
                          />
                        </Box>
                      )}
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.82rem', fontWeight: 600, color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.name}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.phone || '—'}</Box>
                      {isInstagramView && (
                        <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                          {instagramUsername ? `@${instagramUsername}` : '—'}
                        </Box>
                      )}
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.service || '—'}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                        <Chip label={LEAD_STATUS_LABELS[lead.status] || lead.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                      </Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.current_team?.name || 'Unassigned'}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.current_owner?.username || 'Unassigned'}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}><Chip label={lead.assignment_status || (lead.current_owner_id ? 'ASSIGNED' : 'UNASSIGNED')} size="small" sx={{ bgcolor: lead.current_owner_id ? 'var(--bw-tint-green)' : 'var(--bw-surface-2)', color: lead.current_owner_id ? '#15803D' : TEXT_MUTED, fontWeight: 700, fontSize: '0.65rem' }} /></Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.assignedDoctor?.name || 'Unassigned'}</Box>
                      {tableFields.map((field) => (
                        <Box key={field.id} component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                          {formatCrmFieldValue(field, lead.custom_fields?.[field.field_key])}
                        </Box>
                      ))}
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}${detailQuerySuffix}`));
                            }}
                            sx={{ textTransform: 'none', color: GREEN, fontWeight: 700, minWidth: 0 }}
                          >
                            View
                          </Button>
                          {/* Delete is not implemented yet for CRM leads (only website
                              enquiries support it today) — add a matching confirm-dialog
                              delete action here, next to View, when that's built. */}
                        </Stack>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      {(data?.pagination?.totalPages ?? 1) > 1 && (
        <Pagination sx={{ mt: 2 }} page={page} count={data?.pagination.totalPages} onChange={(_, value) => updateParam('page', String(value))} />
      )}
      </>

      <LeadFormDrawer
        clientKey={scopedClientKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        doctors={doctors}
        lead={editingLead}
      />

      <Dialog open={bulkOpen} onClose={() => !bulkAssign.isLoading && setBulkOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 1, sm: 3 } } }}>
        <DialogTitle>Bulk assign {selectedIds.length} lead{selectedIds.length === 1 ? '' : 's'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">Assignment history and the next action are preserved for each selected Lead.</Alert>
            <FormControl size="small" fullWidth>
              <InputLabel id="bulk-team-label">Team</InputLabel>
              <Select labelId="bulk-team-label" label="Team" value={bulkTeamId} onChange={(e) => { setBulkTeamId(String(e.target.value)); setBulkOwnerId(''); }}>
                <MenuItem value=""><em>Select a team</em></MenuItem>
                {teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!bulkTeamId}>
              <InputLabel id="bulk-owner-label">Owner</InputLabel>
              <Select labelId="bulk-owner-label" label="Owner" value={bulkOwnerId} onChange={(e) => setBulkOwnerId(String(e.target.value))}>
                <MenuItem value=""><em>Select an eligible member</em></MenuItem>
                {(bulkTeam?.members || [])
                  .filter((m) => m.status === 'ACTIVE' && m.assignment_enabled)
                  .map((m) => (
                    <MenuItem key={m.management_id} value={m.management_id}>
                      {m.management?.username || `User ${m.management_id}`} · {m.operational_role === 'TEAM_MANAGER' ? 'Team Manager' : 'Telecaller'}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField size="small" fullWidth label="Reason" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} multiline minRows={2} helperText="Optional; included in assignment history." />
            {bulkAssign.isError && <Alert severity="error">Unable to bulk assign these Leads. Review the selected Team and Owner.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, px: 3, py: 2 }}>
          <Button onClick={() => setBulkOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitBulk}
            disabled={!bulkTeamId || !bulkOwnerId || bulkAssign.isLoading}
            sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}
          >
            {bulkAssign.isLoading ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadsPage;
