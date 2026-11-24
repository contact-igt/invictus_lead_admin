import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Pagination, Select, Skeleton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { saveAs } from 'file-saver';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveDoctorsQuery, useBirthwaveLeadsQuery, useBirthwaveTeamsQuery, useSyncRepliLeadsMutation,
  useBirthwaveServicesQuery, useDeleteSelectedBirthwaveLeadsMutation,
  useDeleteBirthwaveLeadMutation,
} from 'components/hooks/useBirthwaveQuery';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import { BirthwaveApis, BirthwaveLead } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import {
  CLINIC_CONCERN_LABELS, CLINIC_HEARD_FROM_LABELS, CLINIC_PROVIDER, CLINIC_VIEW_KEY,
  LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, WEBSITE_SOURCE_LABELS,
} from '../constants';
import PortalPageHeader from '../PortalPageHeader';
import LeadFormDrawer from '../LeadFormDrawer';
import CrmFieldFilterControl from '../crm/CrmFieldFilterControl';
import { formatCrmFieldValue } from '../crm/formatCrmFieldValue';
import DateRangeControl from '../DateRangeControl';
import { DateRangePreset, PRESET_LABELS, resolvePresetRange } from '../dateRangePresets';

// Clinic check-in registrations collect these as checkboxes, so each value is
// a JSON array — joined for display rather than a single label.
const clinicListValue = (values: unknown, labels: Record<string, string>) =>
  Array.isArray(values) && values.length ? values.map((v) => labels[String(v)] || String(v)).join(', ') : '—';

const formatClinicDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const submittedAtFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
});

const formatClinicAddress = (address?: { line1?: string | null; city?: string | null } | null) =>
  [address?.line1, address?.city].filter(Boolean).join(', ') || '—';

const extractFileName = (contentDisposition?: string): string | null => {
  const match = String(contentDisposition || '').match(/filename="?([^";]+)"?/i);
  return match?.[1] || null;
};

const getMutationErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';
const selectionCheckboxSx = {
  color: TEXT_MUTED,
  '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: GREEN },
};

const SelectionMark = ({ state }: { state?: 'checked' | 'mixed' }) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={{
      width: 20,
      height: 20,
      display: 'grid',
      placeItems: 'center',
      boxSizing: 'border-box',
      border: '2px solid currentColor',
      borderColor: state ? 'currentColor' : 'color-mix(in srgb, currentColor 65%, transparent)',
      borderRadius: '5px',
      bgcolor: state ? 'currentColor' : 'transparent',
    }}
  >
    {state && <Icon icon={state === 'checked' ? 'mdi:check' : 'mdi:minus'} width={15} color="#fff" />}
  </Box>
);


const LeadsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<BirthwaveLead | null>(null);
  const { user } = useAuth();
  const [deletingLead, setDeletingLead] = useState<BirthwaveLead | null>(null);
  const deleteLead = useDeleteBirthwaveLeadMutation(scopedClientKey);
  const canDelete = ['super-admin', 'admin', 'client'].includes((user?.role || '').toLowerCase());
  const { enqueueSnackbar } = useSnackbar();
  const [isExporting, setIsExporting] = useState(false);
  const sync = useSyncRepliLeadsMutation();
  const canSync = ['super-admin', 'admin'].includes((user?.role || '').toLowerCase()) && activeClientKey === 'birthwave';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const view = searchParams.get('view') || 'crm';
  // Carry the active view onto the detail route so "Back to Leads" returns to
  // this same filtered list (Instagram Leads / a website source) rather than
  // the default "All Leads".
  const detailQuerySuffix = view !== 'crm' ? `?view=${encodeURIComponent(view)}` : '';
  const isInstagramView = view === 'instagram';
  const isClinicView = view === CLINIC_VIEW_KEY;
  const isWebsiteView = view !== 'crm' && !isInstagramView;
  const isWebsiteSubmissionView = isWebsiteView && !isClinicView;
  const showPregnancyWeeks = view === 'birthwave_prenatal_yoga';

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const source = searchParams.get('source') || '';
  const serviceId = searchParams.get('service_id') || '';
  const rangePreset = (searchParams.get('range') as DateRangePreset) || 'all';
  const customFrom = searchParams.get('from') || '';
  const customTo = searchParams.get('to') || '';
  const cfKey = searchParams.get('cf_key') || '';
  const cfValue = searchParams.get('cf_value') || '';
  const teamId = searchParams.get('team_id') || '';
  const ownerId = searchParams.get('owner_id') || '';
  const assignmentStatus = searchParams.get('assignment_status') || '';
  const heardFrom = searchParams.get('heard_from') || '';

  const dateRange = useMemo(
    () => (rangePreset === 'custom' ? (customFrom && customTo ? { startDate: customFrom, endDate: customTo } : null) : resolvePresetRange(rangePreset)),
    [rangePreset, customFrom, customTo],
  );

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
    params.delete('page');
    params.delete('range');
    params.delete('from');
    params.delete('to');
    setSearchParams(params, { replace: true });
  };
  const handleRangePresetChange = (next: DateRangePreset) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (next === 'all') params.delete('range');
    else params.set('range', next);
    if (next !== 'custom') {
      params.delete('from');
      params.delete('to');
    }
    setSearchParams(params, { replace: true });
  };
  const handleCustomDateChange = (key: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    params.set('range', 'custom');
    if (value) params.set(key, value);
    else params.delete(key);
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
  const tableColumns = [
    ...(isClinicView
      ? ['Date of visit', 'Name', 'DOB', 'Phone', 'Email', 'Address', 'Here for', 'Referred by']
      : ['Name', 'Phone', ...(isInstagramView ? ['Instagram'] : []), 'Service']),
    ...(isWebsiteSubmissionView
      ? ['Email', 'Submitted (IST)', ...(showPregnancyWeeks ? ['Pregnancy Weeks'] : []), 'Enquiry Message']
      : ['Source']),
    'Status',
    ...(!isWebsiteSubmissionView ? ['Team', 'Owner', 'Assignment', 'Assigned Doctor'] : []),
    ...tableFields.map((field) => field.label),
    '',
  ];
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
      source: isInstagramView ? 'instagram' : isClinicView ? CLINIC_VIEW_KEY : isWebsiteView ? 'website' : source || undefined,
      service_id: serviceId || undefined,
      source_provider: isInstagramView ? 'REPLI' : isClinicView ? CLINIC_PROVIDER : isWebsiteView ? view : undefined,
      start_date: dateRange?.startDate || undefined,
      end_date: dateRange?.endDate || undefined,
      heard_from: isClinicView ? heardFrom || undefined : undefined,
      custom_field_key: cfKey && cfValue !== '' ? cfKey : undefined,
      custom_field_value: cfKey && cfValue !== '' ? cfValue : undefined,
      team_id: teamId || undefined,
      owner_id: ownerId || undefined,
      assignment_status: assignmentStatus || undefined,
      limit: 50,
      page,
    }),
    [search, status, source, serviceId, dateRange, heardFrom, cfKey, cfValue, teamId, ownerId, assignmentStatus, isInstagramView, isClinicView, isWebsiteView, view, page],
  );

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      // Same `params` the table itself queries with (page/limit are ignored by
      // the export endpoint), so the export always matches exactly what's on
      // screen — search, filters, and the active date range.
      const response = await BirthwaveApis.exportLeads(scopedClientKey, params);
      const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'text/csv;charset=utf-8' });
      const fallbackName = `birthwave-${view}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      const fileName = extractFileName(response.headers?.['content-disposition']) || fallbackName;
      saveAs(blob, fileName);
    } catch (error: any) {
      enqueueSnackbar(getMutationErrorMessage(error, 'Failed to export leads'), { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isLoading } = useBirthwaveLeadsQuery(scopedClientKey, params, { enabled: hasScope });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const { data: teams = [] } = useBirthwaveTeamsQuery(scopedClientKey, {}, { enabled: hasScope });
  // All services so an existing filter on a retired service still resolves.
  const { data: services = [] } = useBirthwaveServicesQuery(scopedClientKey, {}, { enabled: hasScope });
  const leads = data?.data ?? [];

  const [selection, setSelection] = useState<number[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const deleteSelected = useDeleteSelectedBirthwaveLeadsMutation(scopedClientKey);
  const selectableIds = leads.map((lead) => lead.id);
  const selectedIds = selectableIds.filter((id) => selection.includes(id));
  const allSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;
  const selectionScope = searchParams.toString();

  useEffect(() => {
    setSelection([]);
    setBulkDeleteOpen(false);
  }, [scopedClientKey, selectionScope]);

  const toggleOne = (id: number) =>
    setSelection((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]);
  const toggleAll = () => setSelection(allSelected ? [] : selectableIds);
  const submitBulkDelete = () => {
    if (!canDelete || !selectedIds.length || deleteSelected.isLoading) return;
    const ids = selectedIds;
    deleteSelected.mutate(ids, {
      onSuccess: (failedIds) => {
        const deletedCount = ids.length - failedIds.length;
        setBulkDeleteOpen(false);
        setSelection(failedIds);
        if (failedIds.length) {
          enqueueSnackbar(`${deletedCount} deleted. ${failedIds.length} could not be deleted and remain selected.`, { variant: 'error' });
        } else {
          enqueueSnackbar(`${deletedCount} lead${deletedCount === 1 ? '' : 's'} deleted`, { variant: 'success' });
          if (allSelected && page > 1) updateParam('page', String(page - 1));
        }
      },
    });
  };
  const activeFilters = [
    status && { key: 'status', label: LEAD_STATUS_LABELS[status] || status },
    // Source is fixed (not a removable filter) on the Instagram Leads view.
    !isInstagramView && source && { key: 'source', label: LEAD_SOURCE_LABELS[source] || source },
    dateRange && {
      key: 'range',
      label: rangePreset === 'custom' ? `${dateRange.startDate} → ${dateRange.endDate}` : PRESET_LABELS[rangePreset],
    },
    isClinicView && heardFrom && { key: 'heard_from', label: `Heard about us: ${CLINIC_HEARD_FROM_LABELS[heardFrom] || heardFrom}` },
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
          (isInstagramView
            ? 'Instagram Leads'
            : isClinicView
              ? 'Clinic registrations'
              : isWebsiteView
                ? WEBSITE_SOURCE_LABELS[view] || 'Leads'
                : 'Leads') + (data?.pagination?.total !== undefined ? ` (${data.pagination.total})` : '')
        }
        subtitle={
          isInstagramView
            ? 'Leads captured from Birthwave Instagram through Repli'
            : isClinicView
              ? 'Patients who checked in through the clinic registration form'
              : isWebsiteView
              ? 'CRM leads captured from this website source'
              : 'Search, filter, and manage every Birthwave lead'
        }
        action={
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="outlined"
              disabled={isExporting || isLoading}
              startIcon={<Icon icon="mdi:download" width={18} height={18} />}
              onClick={handleExportCsv}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', borderColor: CARD_BORDER, color: TEXT_DARK, '&:hover': { borderColor: GREEN, bgcolor: 'var(--bw-hover)' } }}
            >
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </Button>
            {isInstagramView ? (canSync ? (
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
            )}
          </Stack>
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
        {isClinicView && (
          <Select size="small" displayEmpty value={heardFrom} onChange={(e) => updateParam('heard_from', e.target.value)} sx={{ minWidth: 190 }}>
            <MenuItem value="">All "Heard about us"</MenuItem>
            {Object.entries(CLINIC_HEARD_FROM_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        )}
        <DateRangeControl
          preset={rangePreset}
          onPresetChange={handleRangePresetChange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={(value) => handleCustomDateChange('from', value)}
          onCustomToChange={(value) => handleCustomDateChange('to', value)}
          showAllOption
        />
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

      {canDelete && selectedIds.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: 'var(--bw-tint-green)', border: '1px solid', borderColor: CARD_BORDER }}
        >
          <Typography sx={{ fontWeight: 700, color: TEXT_DARK, fontSize: '0.85rem', flexGrow: 1 }}>
            {selectedIds.length} lead{selectedIds.length === 1 ? '' : 's'} selected
          </Typography>
          <Button size="small" disabled={deleteSelected.isLoading} onClick={() => setSelection([])} sx={{ textTransform: 'none', color: TEXT_MUTED }}>
            Clear selection
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Icon icon="mdi:trash-can-outline" width={18} />}
            onClick={() => setBulkDeleteOpen(true)}
            disabled={deleteSelected.isLoading || deleteLead.isLoading}
            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
          >
            Delete selected
          </Button>
        </Stack>
      )}

      {isLoading && <Box role="status" sx={visuallyHidden}>Loading leads</Box>}
      <Box aria-busy={isLoading} sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden' }}>
        {!isLoading && leads.length === 0 ? (
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
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: isClinicView ? 1760 : 1120 }}>
              <Box component="thead">
                <Box component="tr">
                  {canDelete && (
                    <Box component="th" sx={{ width: 44, px: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                      <Checkbox
                        size="small"
                        disabled={isLoading || deleteSelected.isLoading}
                        sx={selectionCheckboxSx}
                        icon={<SelectionMark />}
                        checkedIcon={<SelectionMark state="checked" />}
                        indeterminateIcon={<SelectionMark state="mixed" />}
                        checked={allSelected}
                        indeterminate={!allSelected && selectableIds.some((id) => selectedIds.includes(id))}
                        onChange={toggleAll}
                        inputProps={{ 'aria-label': 'Select all leads on this page' }}
                      />
                    </Box>
                  )}
                  {tableColumns.map((col, index) => (
                    <Box component="th" key={`${col}-${index}`} sx={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_MUTED, borderBottom: '1px solid', borderColor: CARD_BORDER, py: 1.25, px: 2 }}>
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {isLoading ? Array.from({ length: 5 }, (_, rowIndex) => (
                  <Box component="tr" key={rowIndex} aria-hidden="true" sx={{ height: 49, '& td': { borderBottom: '1px solid', borderColor: CARD_BORDER } }}>
                    {canDelete && (
                      <Box component="td" sx={{ px: 1 }}>
                        <Skeleton variant="rounded" width={16} height={16} sx={{ mx: 'auto' }} />
                      </Box>
                    )}
                    {tableColumns.map((column, columnIndex) => (
                      <Box component="td" key={columnIndex} sx={{ px: 2 }}>
                        <Skeleton
                          variant="rounded"
                          height={column === 'Status' ? 22 : 12}
                          width={column === 'Status' || !column ? 48 : `${55 + ((rowIndex + columnIndex) % 3) * 12}%`}
                          sx={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                        />
                      </Box>
                    ))}
                  </Box>
                )) : leads.map((lead) => {
                  const statusColor = LEAD_STATUS_COLORS[lead.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
                  const instagramUsername =
                    typeof lead.integration_metadata?.instagram_username === 'string'
                      ? lead.integration_metadata.instagram_username
                      : null;
                  const clinicMeta = isClinicView
                    ? (lead.integration_metadata?.clinic_registration as Record<string, any> | undefined)
                    : undefined;
                  const hereForValue = isClinicView ? clinicListValue(clinicMeta?.concerns, CLINIC_CONCERN_LABELS) : (lead.service || '—');
                  const referredByValue = (() => {
                    const list = clinicListValue(clinicMeta?.heard_about_us, CLINIC_HEARD_FROM_LABELS);
                    const other = clinicMeta?.heard_about_us_other ? `${list === '—' ? 'Other' : list} (${clinicMeta.heard_about_us_other})` : list;
                    return other;
                  })();
                  // "Date of visit" is the clinic check-in day, not the moment
                  // the form was submitted — falls back through registered_at
                  // then created_at only for older records missing clinic_date.
                  const dateOfVisitValue = formatClinicDate(clinicMeta?.clinic_date || clinicMeta?.registered_at || lead.created_at);
                  const dobValue = formatClinicDate(clinicMeta?.date_of_birth);
                  const addressValue = formatClinicAddress(clinicMeta?.address);
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
                      {canDelete && (
                        <Box component="td" sx={{ px: 1, borderBottom: '1px solid', borderColor: CARD_BORDER }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            disabled={deleteSelected.isLoading}
                            sx={selectionCheckboxSx}
                            icon={<SelectionMark />}
                            checkedIcon={<SelectionMark state="checked" />}
                            onKeyDown={(e) => e.stopPropagation()}
                            checked={selectedIds.includes(lead.id)}
                            onChange={() => toggleOne(lead.id)}
                            inputProps={{ 'aria-label': `Select ${lead.name}` }}
                          />
                        </Box>
                      )}
                      {isClinicView ? (
                        <>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{dateOfVisitValue}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.82rem', fontWeight: 600, color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.name}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{dobValue}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.phone || '—'}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.email || '—'}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{addressValue}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{hereForValue}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{referredByValue}</Box>
                        </>
                      ) : (
                        <>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.82rem', fontWeight: 600, color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.name}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.phone || '—'}</Box>
                          {isInstagramView && (
                            <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                              {instagramUsername ? `@${instagramUsername}` : '—'}
                            </Box>
                          )}
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{hereForValue}</Box>
                        </>
                      )}
                      {isWebsiteSubmissionView ? (
                        [
                          { label: 'Email', value: lead.email },
                          { label: 'Submitted', value: lead.created_at && Number.isFinite(Date.parse(lead.created_at)) ? submittedAtFormatter.format(new Date(lead.created_at)) : null },
                          ...(showPregnancyWeeks ? [{ label: 'Pregnancy Weeks', value: lead.pregnancy_weeks }] : []),
                          { label: 'Enquiry Message', value: lead.notes },
                        ].map(({ label, value }) => (
                          <Box key={label} component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK }}>
                            <Box sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value == null ? undefined : String(value)}>
                              {value || (value === 0 ? 0 : '—')}
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'}</Box>
                      )}
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                        <Chip label={LEAD_STATUS_LABELS[lead.status] || lead.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                      </Box>
                      {!isWebsiteSubmissionView && (
                        <>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.current_team?.name || 'Unassigned'}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.current_owner?.username || 'Unassigned'}</Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}><Chip label={lead.assignment_status || (lead.current_owner_id ? 'ASSIGNED' : 'UNASSIGNED')} size="small" sx={{ bgcolor: lead.current_owner_id ? 'var(--bw-tint-green)' : 'var(--bw-surface-2)', color: lead.current_owner_id ? '#15803D' : TEXT_MUTED, fontWeight: 700, fontSize: '0.65rem' }} /></Box>
                          <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.assignedDoctor?.name || 'Unassigned'}</Box>
                        </>
                      )}
                      {tableFields.map((field) => (
                        <Box key={field.id} component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                          {formatCrmFieldValue(field, lead.custom_fields?.[field.field_key])}
                        </Box>
                      ))}
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View lead">
                            <IconButton
                              size="small"
                              aria-label={`View ${lead.name}`}
                              onKeyDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}${detailQuerySuffix}`));
                              }}
                              sx={{ color: GREEN }}
                            >
                              <Icon icon="mdi:eye-outline" width={20} />
                            </IconButton>
                          </Tooltip>
                          {canDelete && (
                            <Tooltip title="Delete lead">
                              <span>
                                <IconButton size="small" color="error" aria-label={`Delete ${lead.name}`} disabled={deleteLead.isLoading} onKeyDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setDeletingLead(lead); }}>
                                  <Icon icon="mdi:trash-can-outline" width={20} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
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

      <Dialog open={Boolean(deletingLead)} onClose={() => !deleteLead.isLoading && setDeletingLead(null)} fullWidth maxWidth="xs" aria-labelledby="delete-lead-title">
        <DialogTitle id="delete-lead-title">Delete lead?</DialogTitle>
        <DialogContent>
          <Typography>Delete {deletingLead?.name || 'this lead'} and its tasks, appointments, assignment history, outcomes and timeline? This cannot be undone.</Typography>
          <Typography sx={{ mt: 1, color: TEXT_MUTED, fontSize: '0.8rem' }}>The contact, original website enquiry and Google Sheet row will remain.</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleteLead.isLoading} onClick={() => setDeletingLead(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={deleteLead.isLoading} onClick={() => {
            if (!deletingLead) return;
            const id = deletingLead.id;
            deleteLead.mutate(id, { onSuccess: () => {
              setDeletingLead(null);
              setSelection((ids) => ids.filter((selected) => selected !== id));
              if (leads.length === 1 && page > 1) updateParam('page', String(page - 1));
            } });
          }}>{deleteLead.isLoading ? 'Deleting...' : 'Delete lead'}</Button>
        </DialogActions>
      </Dialog>

      <LeadFormDrawer
        clientKey={scopedClientKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        doctors={doctors}
        lead={editingLead}
      />

      <Dialog open={bulkDeleteOpen} onClose={() => !deleteSelected.isLoading && setBulkDeleteOpen(false)} fullWidth maxWidth="xs" aria-labelledby="delete-selected-leads-title">
        <DialogTitle id="delete-selected-leads-title">Delete selected leads?</DialogTitle>
        <DialogContent>
          <Typography>Delete {selectedIds.length} selected lead{selectedIds.length === 1 ? '' : 's'} and their CRM history? This cannot be undone.</Typography>
          <Typography sx={{ mt: 1, color: TEXT_MUTED, fontSize: '0.8rem' }}>Contacts, original website enquiries and Google Sheet rows will remain.</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleteSelected.isLoading} onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={deleteSelected.isLoading || !selectedIds.length} onClick={submitBulkDelete}>
            {deleteSelected.isLoading ? 'Deleting…' : 'Delete selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadsPage;
