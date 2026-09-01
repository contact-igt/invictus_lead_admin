import { Box, Chip, IconButton, Skeleton, Stack, Typography, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { BirthwaveLead } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '../constants';
import { cardSx, sectionTitleSx, GREEN, TEXT_DARK, TEXT_MUTED, CARD_BORDER } from './ui';

interface RecentLeadsTableProps {
  clientKey: string;
  leads: BirthwaveLead[];
  loading?: boolean;
}

const formatFollowUp = (value: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const COLUMNS = ['Name', 'Service', 'Source', 'Status', 'Assigned To', 'Next Follow-up', 'Action'];

const RecentLeadsTable = ({ clientKey, leads, loading }: RecentLeadsTableProps) => {
  const navigate = useNavigate();

  return (
  <Box sx={cardSx}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography sx={sectionTitleSx}>Recent Leads</Typography>
      <MuiLink
        component={Link}
        to={buildClientPortalPath(clientKey, 'leads')}
        sx={{ fontSize: '0.78rem', fontWeight: 600, color: GREEN, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        View all
      </MuiLink>
    </Stack>

    {loading ? (
      <Stack direction="column" spacing={1}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    ) : leads.length === 0 ? (
      <Typography variant="body2" sx={{ color: TEXT_MUTED, py: 2 }}>
        No leads yet — use "Add Lead" to create the first one.
      </Typography>
    ) : (
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <Box component="thead">
            <Box component="tr">
              {COLUMNS.map((col) => (
                <Box
                  component="th"
                  key={col}
                  sx={{
                    textAlign: 'left',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: TEXT_MUTED,
                    borderBottom: '1px solid',
                    borderColor: CARD_BORDER,
                    py: 1,
                    pr: 2,
                  }}
                >
                  {col}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {leads.map((lead) => {
              const statusColor = LEAD_STATUS_COLORS[lead.status] || { bg: '#F1F5F9', fg: TEXT_MUTED };
              return (
                <Box
                  component="tr"
                  key={lead.id}
                  onClick={() => navigate(buildClientPortalPath(clientKey, `leads/${lead.id}`))}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${lead.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(buildClientPortalPath(clientKey, `leads/${lead.id}`));
                    }
                  }}
                  sx={{ cursor: 'pointer', '&:hover td': { bgcolor: 'rgba(15,23,42,0.02)' }, '&:focus-visible': { outline: '2px solid #29AF81', outlineOffset: -2 } }}
                >
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.82rem', fontWeight: 600, color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                    {lead.name}
                  </Box>
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                    {lead.service || '—'}
                  </Box>
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                    {lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'}
                  </Box>
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                    <Chip
                      label={LEAD_STATUS_LABELS[lead.status] || lead.status}
                      size="small"
                      sx={{
                        bgcolor: statusColor.bg,
                        color: statusColor.fg,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: 22,
                      }}
                    />
                  </Box>
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                    {lead.assignedDoctor?.name || 'Unassigned'}
                  </Box>
                  <Box component="td" sx={{ py: 1.15, pr: 2, borderBottom: '1px solid', borderColor: CARD_BORDER, fontSize: '0.8rem', color: TEXT_DARK, whiteSpace: 'nowrap' }}>
                    {formatFollowUp(lead.next_follow_up)}
                  </Box>
                  <Box component="td" sx={{ py: 1.15, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
                    <IconButton
                      component={Link}
                      to={buildClientPortalPath(clientKey, `leads/${lead.id}`)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open ${lead.name}`}
                      size="small"
                      sx={{ color: TEXT_MUTED, '&:hover': { color: GREEN } }}
                    >
                      <Icon icon="hugeicons:arrow-right-01" width={16} height={16} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    )}
  </Box>
  );
};

export default RecentLeadsTable;
