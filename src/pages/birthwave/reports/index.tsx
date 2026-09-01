import { Box, Stack, Typography } from '@mui/material';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveDashboardQuery } from 'components/hooks/useBirthwaveQuery';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from '../constants';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 1.25, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{value}</Typography>
  </Stack>
);

const ReportsPage = () => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const { data: dashboard, isLoading } = useBirthwaveDashboardQuery(scopedClientKey, {}, { enabled: hasScope });

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Reports" subtitle="Lead and appointment performance at a glance" />

      {isLoading ? (
        <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
          <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: 3 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK, mb: 1.5 }}>Key Metrics</Typography>
            <StatRow label="Total Leads" value={dashboard?.kpis.total_leads ?? 0} />
            <StatRow label="New Today" value={dashboard?.kpis.new_leads_today ?? 0} />
            <StatRow label="Appointments Booked" value={dashboard?.kpis.appointments_booked ?? 0} />
            <StatRow label="Confirmed Visits" value={dashboard?.kpis.confirmed_visits ?? 0} />
            <StatRow label="No-Shows" value={dashboard?.kpis.no_shows ?? 0} />
            <StatRow label="Conversion Rate" value={`${dashboard?.kpis.conversion_rate ?? 0}%`} />
          </Box>

          <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: 3 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK, mb: 1.5 }}>Pipeline Breakdown</Typography>
            {(dashboard?.pipeline ?? []).map((stage) => (
              <StatRow key={stage.status} label={LEAD_STATUS_LABELS[stage.status] || stage.status} value={stage.count} />
            ))}
          </Box>

          <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: 3 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK, mb: 1.5 }}>Lead Sources</Typography>
            {(dashboard?.lead_sources ?? []).length === 0 ? (
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>No data yet.</Typography>
            ) : (
              (dashboard?.lead_sources ?? []).map((source) => (
                <StatRow
                  key={source.source}
                  label={LEAD_SOURCE_LABELS[source.source] || source.source}
                  value={`${source.count} (${source.percentage}%)`}
                />
              ))
            )}
          </Box>
        </Box>
      )}

      <Typography sx={{ fontSize: '0.75rem', color: TEXT_MUTED, mt: 3 }}>
        Figures reflect all-time totals unless a date range is applied from the Dashboard.
      </Typography>
    </Box>
  );
};

export default ReportsPage;
