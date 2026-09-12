import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveDashboardQuery, useBirthwaveDoctorsQuery } from 'components/hooks/useBirthwaveQuery';
import { LEAD_SOURCE_LABELS } from '../constants';
import { cardSx, GREEN, TEXT_DARK, TEXT_MUTED } from './ui';
import { buildClientPortalPath } from 'routes/paths';
import {
  DateRangePreset,
  resolvePresetRange,
} from '../dateRangePresets';
import DateRangeControl from '../DateRangeControl';
import LeadsOverTimeChart from './LeadsOverTimeChart';
import LeadSourcesDonut from './LeadSourcesDonut';
import DoctorAppointments from './DoctorAppointments';
import LeadPipeline from './LeadPipeline';
import RecentLeadsTable from './RecentLeadsTable';
import RightRailPanels from './RightRailPanels';
import LeadFormDrawer from '../LeadFormDrawer';

interface KpiConfig {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend: number | null;
  onClick?: () => void;
}

const KpiCard = ({ label, value, icon, color, trend, onClick }: KpiConfig) => (
  <Box
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    sx={{
      ...cardSx,
      flex: '1 1 150px',
      minWidth: 150,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 120ms ease, border-color 120ms ease',
      '&:hover': onClick ? { borderColor: GREEN, boxShadow: '0 2px 10px rgba(41,175,129,0.12)' } : undefined,
      '&:focus-visible': onClick ? { outline: `2px solid ${GREEN}`, outlineOffset: 2 } : undefined,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '10px',
          bgcolor: `${color}1A`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon icon={icon} width={19} height={19} color={color} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: TEXT_DARK, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {trend !== null && (
            <Typography
              sx={{ fontSize: '0.68rem', fontWeight: 700, color: trend >= 0 ? '#16A34A' : '#EF4444' }}
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
          )}
        </Stack>
        <Typography noWrap sx={{ fontSize: '0.72rem', color: TEXT_MUTED, fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const DashboardPage = () => {
  const { activeClientKey, hasScope, scopedClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [source, setSource] = useState('');

  const preset = (searchParams.get('range') as DateRangePreset) || 'today';
  const customFrom = searchParams.get('from') || '';
  const customTo = searchParams.get('to') || '';

  const setPreset = (next: DateRangePreset) => {
    const params = new URLSearchParams(searchParams);
    params.set('range', next);
    if (next !== 'custom') {
      params.delete('from');
      params.delete('to');
    }
    setSearchParams(params, { replace: true });
  };

  const setCustomFrom = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('range', 'custom');
    params.set('from', value);
    setSearchParams(params, { replace: true });
  };

  const setCustomTo = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('range', 'custom');
    params.set('to', value);
    setSearchParams(params, { replace: true });
  };

  const resolvedRange = useMemo(() => {
    if (preset === 'custom') {
      return customFrom && customTo ? { startDate: customFrom, endDate: customTo } : null;
    }
    return resolvePresetRange(preset);
  }, [preset, customFrom, customTo]);

  const dashboardParams = useMemo(
    () => ({
      ...(resolvedRange ? { start_date: resolvedRange.startDate, end_date: resolvedRange.endDate } : {}),
      ...(source ? { source } : {}),
    }),
    [resolvedRange, source],
  );

  const { data: dashboard, isLoading } = useBirthwaveDashboardQuery(scopedClientKey, dashboardParams, {
    enabled: hasScope,
  });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  const goToLeads = (extra: Record<string, string> = {}) => {
    const params = new URLSearchParams({ ...(resolvedRange ? { from: resolvedRange.startDate, to: resolvedRange.endDate } : {}), ...extra });
    navigate(`${buildClientPortalPath(activeClientKey, 'leads')}?${params.toString()}`);
  };

  const goToAppointments = (extra: Record<string, string> = {}) => {
    const params = new URLSearchParams({ ...(resolvedRange ? { from: resolvedRange.startDate, to: resolvedRange.endDate } : {}), ...extra });
    navigate(`${buildClientPortalPath(activeClientKey, 'appointments')}?${params.toString()}`);
  };

  const kpis = dashboard?.kpis;
  const operational = dashboard?.operational;
  const op = operational?.kpis || {};
  const kpiCards: KpiConfig[] = [
    ['new_leads', 'New Leads', 'solar:user-plus-rounded-linear', '#2563EB'], ['assigned_leads', 'Assigned Leads', 'hugeicons:user-check-02', GREEN], ['unassigned_leads', 'Unassigned Leads', 'hugeicons:user-question-02', '#EF4444'], ['tasks_due_today', 'Tasks Due Today', 'hugeicons:task-02', '#F59E0B'], ['tasks_completed_today', 'Tasks Completed Today', 'solar:check-circle-linear', '#16A34A'], ['overdue_tasks', 'Overdue Tasks', 'solar:alarm-linear', '#EF4444'], ['follow_ups_due', 'Follow-ups Due', 'solar:clock-circle-linear', '#7C3AED'], ['appointments_today', 'Appointments Today', 'solar:calendar-mark-linear', '#0EA5E9'], ['appointments_completed_attended', 'Completed / Attended', 'solar:check-circle-linear', '#16A34A'], ['no_shows', 'No Shows', 'solar:close-circle-linear', '#EF4444'], ['open_attention', 'Open Needs Attention', 'hugeicons:alert-02', '#DC2626'], ['lost_leads', 'Lost Leads', 'solar:archive-down-minimalistic-linear', '#64748B'], ['invalid_leads', 'Invalid Leads', 'solar:danger-triangle-linear', '#64748B'],
  ].map(([id, label, icon, color]) => ({ id, label, value: op[id] ?? 0, icon, color, trend: null }));

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem' }, fontWeight: 800, color: TEXT_DARK, letterSpacing: '-0.01em' }}>
            IGT Lead Panel
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mt: 0.5 }}>
            Lead, appointment and follow-up overview
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
          <DateRangeControl
            preset={preset}
            onPresetChange={setPreset}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
          />

          <Select
            size="small"
            displayEmpty
            value={source}
            onChange={(e) => setSource(e.target.value)}
            sx={{ height: 38, fontSize: '0.8rem', minWidth: 0, width: { xs: '100%', sm: 150 } }}
            inputProps={{ 'aria-label': 'Filter by source' }}
          >
            <MenuItem value="">All Sources</MenuItem>
            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:plus" width={18} height={18} />}
            onClick={() => setAddLeadOpen(true)}
            sx={{
              height: 38,
              px: 2.25,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: GREEN,
              boxShadow: 'none',
              flexShrink: 0,
              '&:hover': { bgcolor: '#218D68', boxShadow: 'none' },
            }}
          >
            Add Lead
          </Button>
        </Stack>
      </Stack>

      {/* KPI row */}
      <Stack direction="row" flexWrap="wrap" gap={2} mb={2.5}>
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <Box sx={{ ...cardSx, p: 2.25 }}><Typography sx={{ fontWeight: 800, color: TEXT_DARK, mb: 1.5 }}>Lead Sources</Typography>{(operational?.lead_sources || []).slice(0, 8).map((row) => <Stack key={row.source} direction="row" justifyContent="space-between" sx={{ py: 0.55 }}><Typography variant="body2" color="text.secondary">{row.source}</Typography><Typography variant="body2" fontWeight={800}>{row.count}</Typography></Stack>)}{!operational?.lead_sources?.length && <Typography variant="body2" color="text.secondary">No leads in this range.</Typography>}</Box>
        <Box sx={{ ...cardSx, p: 2.25 }}><Typography sx={{ fontWeight: 800, color: TEXT_DARK, mb: 1.5 }}>Services</Typography>{(operational?.service_breakdown || []).slice(0, 8).map((row) => <Stack key={row.service} direction="row" justifyContent="space-between" sx={{ py: 0.55 }}><Typography variant="body2" color="text.secondary">{row.service}</Typography><Typography variant="body2" fontWeight={800}>{row.count}</Typography></Stack>)}{!operational?.service_breakdown?.length && <Typography variant="body2" color="text.secondary">No services in this range.</Typography>}</Box>
        <Box sx={{ ...cardSx, p: 2.25 }}><Typography sx={{ fontWeight: 800, color: TEXT_DARK, mb: 1.5 }}>Appointments Today</Typography>{Object.entries(operational?.appointment_summary || {}).map(([key, value]) => <Stack key={key} direction="row" justifyContent="space-between" sx={{ py: 0.55 }}><Typography variant="body2" color="text.secondary">{key.replace(/_/g, ' ')}</Typography><Typography variant="body2" fontWeight={800}>{value}</Typography></Stack>)}</Box>
      </Box>

      {/* Analytics row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 3fr 4fr' },
          gap: 2.5,
          mb: 2.5,
          '& > *': { minWidth: 0 },
        }}
      >
        <LeadsOverTimeChart points={dashboard?.leads_over_time ?? []} loading={isLoading} />
        <LeadSourcesDonut
          sources={dashboard?.lead_sources ?? []}
          totalLeads={kpis?.total_leads ?? 0}
          loading={isLoading}
          onSourceClick={(src) => goToLeads({ source: src })}
        />
        <DoctorAppointments
          clientKey={activeClientKey}
          doctors={dashboard?.doctor_wise_appointments ?? []}
          loading={isLoading}
          onDoctorClick={(doctorId) => goToAppointments({ doctor_id: String(doctorId) })}
        />
      </Box>

      {/* Pipeline */}
      <Box mb={2.5}>
        <LeadPipeline
          pipeline={dashboard?.pipeline ?? []}
          loading={isLoading}
          onStageClick={(status) => goToLeads({ status })}
        />
      </Box>

      {/* Bottom row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' },
          gap: 2.5,
          '& > *': { minWidth: 0 },
        }}
      >
        <RecentLeadsTable clientKey={activeClientKey} leads={dashboard?.recent_leads ?? []} loading={isLoading} />
        <RightRailPanels
          clientKey={activeClientKey}
          followUps={dashboard?.follow_up_reminders ?? []}
          schedule={dashboard?.today_schedule ?? []}
          loading={isLoading}
        />
      </Box>

      <LeadFormDrawer
        clientKey={scopedClientKey}
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        doctors={doctors}
      />
    </Box>
  );
};

export default DashboardPage;
