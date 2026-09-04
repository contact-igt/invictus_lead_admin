import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Chip, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveDoctorsQuery, useBirthwaveLeadsQuery } from 'components/hooks/useBirthwaveQuery';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import { BirthwaveLead } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, WEBSITE_SOURCE_LABELS } from '../constants';
import PortalPageHeader from '../PortalPageHeader';
import LeadFormDrawer from '../LeadFormDrawer';
import CrmFieldFilterControl from '../crm/CrmFieldFilterControl';
import { formatCrmFieldValue } from '../crm/formatCrmFieldValue';
import { BirthwaveWebsiteSourceKey } from 'services/birthwave';
import WebsiteLeadsView from '../website-leads/WebsiteLeadsView';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

const LeadsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<BirthwaveLead | null>(null);

  const view = searchParams.get('view') || 'crm';
  const isInstagramView = view === 'instagram';
  const isWebsiteView = view !== 'crm' && !isInstagramView;

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const source = searchParams.get('source') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const cfKey = searchParams.get('cf_key') || '';
  const cfValue = searchParams.get('cf_value') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
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

  // Instagram Leads is a fixed server-side filter over the same
  // birthwave_leads list endpoint — never a client-side subset of "All Leads"
  // (that would break pagination/totals). The source/source_provider here
  // are forced regardless of any stray `source` query param.
  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      source: isInstagramView ? 'instagram' : source || undefined,
      source_provider: isInstagramView ? 'REPLI' : undefined,
      start_date: from || undefined,
      end_date: to || undefined,
      custom_field_key: cfKey && cfValue !== '' ? cfKey : undefined,
      custom_field_value: cfKey && cfValue !== '' ? cfValue : undefined,
      limit: 50,
    }),
    [search, status, source, from, to, cfKey, cfValue, isInstagramView],
  );

  const { data, isLoading } = useBirthwaveLeadsQuery(scopedClientKey, params, { enabled: hasScope && !isWebsiteView });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const leads = data?.data ?? [];

  const activeFilters = [
    status && { key: 'status', label: LEAD_STATUS_LABELS[status] || status },
    // Source is fixed (not a removable filter) on the Instagram Leads view.
    !isInstagramView && source && { key: 'source', label: LEAD_SOURCE_LABELS[source] || source },
    from && to && { key: 'range', label: `${from} → ${to}` },
    cfKey && cfValue !== '' && activeFilterField && {
      key: 'custom',
      label: `${activeFilterField.label}: ${formatCrmFieldValue(activeFilterField, activeFilterField.field_type === 'boolean' ? cfValue === 'true' : cfValue)}`,
    },
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
              ? WEBSITE_SOURCE_LABELS[view] || 'Leads'
              : 'Leads'
        }
        subtitle={
          isInstagramView
            ? 'Leads captured from Birthwave Instagram through Repli'
            : isWebsiteView
              ? 'Enquiries captured from this source'
              : 'Search, filter, and manage every Birthwave lead'
        }
        action={
          isWebsiteView || isInstagramView ? undefined : (
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

      {isWebsiteView ? (
        <WebsiteLeadsView sourceKey={view as BirthwaveWebsiteSourceKey} />
      ) : (
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
        {!isInstagramView && (
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
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <Box component="thead">
                <Box component="tr">
                  {[
                    'Name',
                    'Phone',
                    ...(isInstagramView ? ['Instagram'] : []),
                    'Service',
                    'Source',
                    'Status',
                    'Assigned To',
                    'Next Follow-up',
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
                      onClick={() => navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}`))}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${lead.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}`));
                        }
                      }}
                      sx={{ cursor: 'pointer', '&:hover td': { bgcolor: 'var(--bw-hover)' }, '&:focus-visible': { outline: '2px solid #29AF81', outlineOffset: -2 } }}
                    >
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
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{lead.assignedDoctor?.name || 'Unassigned'}</Box>
                      <Box component="td" sx={{ py: 1.25, px: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{formatDate(lead.next_follow_up)}</Box>
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
                              navigate(buildClientPortalPath(activeClientKey, `leads/${lead.id}`));
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
      </>
      )}

      <LeadFormDrawer
        clientKey={scopedClientKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        doctors={doctors}
        lead={editingLead}
      />
    </Box>
  );
};

export default LeadsPage;
