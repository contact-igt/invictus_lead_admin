import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import OverviewDashboard from './dark/OverviewDashboard';
import type { KPIItem, DashboardFilters } from './types';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { normalizeClientKey } from 'utils/clientKey';
import { buildDashboardMetrics, buildFollowUpSummaryMetrics, applyDashboardFilters, getAvailableAgents } from './dashboardUtils';
import { usePixelEyeFollowUpCallComplianceSummaryQuery, usePixelEyeQuery } from 'components/hooks/usePixelEyeQuery';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
  const userRole = (user?.role || '').toLowerCase().trim();
  const isSuperAdmin = userRole === 'super-admin';
  const activeClientKey = normalizeClientKey(
    isSuperAdmin ? urlClientKey : user?.clientKey,
  );
  const hasScopedClientContext = !isSuperAdmin || Boolean(activeClientKey);
  const scopedClientKey = isSuperAdmin ? activeClientKey : undefined;
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: '',
    dateTo: '',
    agent: '',
  });

  const {
    data: allLeads = [],
    isLoading,
    isError,
  } = usePixelEyeQuery(scopedClientKey, filters, { enabled: hasScopedClientContext });

  const filteredLeads = useMemo(
    () => applyDashboardFilters(allLeads, filters),
    [allLeads, filters],
  );

  const getLeadsRoute = () => {
    if (isSuperAdmin && activeClientKey) {
      return `/pages/d/${activeClientKey}/leads`;
    }

    return activeClientKey ? `/pages/d/${activeClientKey}/leads` : '/pages';
  };

  const getFollowUpsRoute = (section?: string) => {
    const basePath = isSuperAdmin && activeClientKey
      ? `/pages/d/${activeClientKey}/follow-ups`
      : '/pixel-eye/follow-ups';

    return section ? `${basePath}?section=${section}` : basePath;
  };

  const complianceFilters = useMemo(
    () => ({
      from: filters.dateFrom || undefined,
      to: filters.dateTo || undefined,
      agent_name: filters.agent || undefined,
    }),
    [filters.agent, filters.dateFrom, filters.dateTo],
  );

  const {
    data: complianceSummary,
    isLoading: isComplianceSummaryLoading,
  } = usePixelEyeFollowUpCallComplianceSummaryQuery(scopedClientKey, complianceFilters, {
    enabled: hasScopedClientContext,
  });

  const availableAgents = useMemo(() => getAvailableAgents(allLeads), [allLeads]);
  const followUpSummary = useMemo(
    () => buildFollowUpSummaryMetrics(filteredLeads, complianceSummary),
    [filteredLeads, complianceSummary],
  );
  const metrics = useMemo(
    () => buildDashboardMetrics(filteredLeads, followUpSummary),
    [filteredLeads, followUpSummary],
  );
  const isInitialDashboardLoading =
    (isLoading && allLeads.length === 0) ||
    (isComplianceSummaryLoading && allLeads.length === 0 && !complianceSummary);

  if (isError) {
    return <div style={{ padding: 16 }}>Unable to load dashboard data.</div>;
  }

  if (!hasScopedClientContext) {
    return <div style={{ padding: 16 }}>Please select a client</div>;
  }

  if (import.meta.env.DEV) {
     
    console.debug('PixelEye - Leads payload', allLeads);
     
    console.debug('PixelEye - Filtered leads', filteredLeads);
     
    console.debug('PixelEye - Computed metrics', metrics);
  }

  const kpiItems: KPIItem[] = [
    {
      key: 'total',
      label: 'Total Leads',
      value: metrics.kpis?.totalLeads ?? 0,
      icon: 'solar:users-group-two-rounded-linear',
      color: 'primary',
      status: 'Healthy',
      trend: '+12%',
      trendDirection: 'up',
      comparisonText: 'vs last week · All time',
      sparklineData: [18, 22, 25, 21, 29, 32, 33],
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: metrics.kpis?.contactedLeads ?? 0,
      icon: 'solar:phone-calling-linear',
      color: 'success',
      status: 'Running',
      trend: '+18%',
      trendDirection: 'up',
      comparisonText: 'vs last week · Live monitoring',
      sparklineData: [12, 15, 18, 24, 28, 31, 33],
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'appointments',
      label: 'Appointments',
      value: metrics.kpis?.appointments ?? 0,
      icon: 'solar:calendar-mark-linear',
      color: 'warning',
      status: 'Healthy',
      trend: '+8%',
      trendDirection: 'up',
      comparisonText: 'vs last week · Confirmed',
      sparklineData: [2, 3, 4, 3, 5, 4, 5],
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'lost',
      label: 'Lost',
      value: metrics.kpis?.lostLeads ?? 0,
      icon: 'solar:close-circle-linear',
      color: 'error',
      status: 'Needs Review',
      trend: '-2%',
      trendDirection: 'down',
      comparisonText: 'vs last week · Review needed',
      sparklineData: [1, 2, 0, 1, 0, 1, 0],
      onClick: () => navigate(getLeadsRoute()),
    },
  ];

  const followUpKpiItems: KPIItem[] = [
    {
      key: 'pending-followups',
      label: 'Pending Follow-ups',
      value: metrics.followUpSummary.pendingFollowUps,
      icon: 'solar:playlist-minimalistic-line-duotone',
      color: 'primary',
      status: 'Pending',
      trend: '+5%',
      trendDirection: 'neutral',
      comparisonText: 'vs last week · Scheduled',
      sparklineData: [10, 12, 11, 14, 13, 15, 13],
      onClick: () => navigate(getFollowUpsRoute('all')),
    },
    {
      key: 'due-today',
      label: 'Due Today',
      value: metrics.followUpSummary.dueToday,
      icon: 'solar:calendar-date-linear',
      color: 'warning',
      status: 'Pending',
      trend: '0%',
      trendDirection: 'neutral',
      comparisonText: 'Act now · Due today',
      sparklineData: [2, 1, 3, 2, 0, 1, 0],
      onClick: () => navigate(getFollowUpsRoute('today')),
    },
    {
      key: 'overdue-missed',
      label: 'Overdue',
      value: metrics.followUpSummary.overdueCount,
      icon: 'solar:danger-circle-linear',
      color: 'error',
      status: 'Critical',
      trend: '+3',
      trendDirection: 'down',
      comparisonText: 'Urgent · Action required',
      sparklineData: [1, 0, 2, 1, 2, 4, 3],
      onClick: () => navigate(getFollowUpsRoute('overdue')),
    },
    {
      key: 'call-done',
      label: 'Call Done',
      value: metrics.followUpSummary.callDone,
      icon: 'solar:phone-calling-check-linear',
      color: 'success',
      status: 'Completed',
      trend: '+15%',
      trendDirection: 'up',
      comparisonText: 'vs last week · Completed',
      sparklineData: [0, 1, 0, 2, 1, 1, 1],
      onClick: () => navigate(getFollowUpsRoute('missed')),
    },
    {
      key: 'outcome-pending',
      label: 'Call Received - Outcome Pending',
      value: metrics.followUpSummary.outcomePending,
      icon: 'solar:clock-circle-linear',
      color: 'warning',
      status: 'Needs Review',
      trend: 'Pending',
      trendDirection: 'neutral',
      comparisonText: 'Awaiting outcome log',
      sparklineData: [1, 0, 1, 2, 1, 0, 1],
      onClick: () => navigate(getFollowUpsRoute('priority')),
    },
  ];

  const handleApplyFilters = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', agent: '' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <OverviewDashboard
        metrics={metrics}
        leads={filteredLeads}
        loading={isInitialDashboardLoading}
        topKpiItems={kpiItems}
        followUpKpiItems={followUpKpiItems}
        filters={filters}
        availableAgents={availableAgents}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        onTodayFollowUpsClick={() => navigate(getFollowUpsRoute('today'))}
        onNotAnsweringClick={() => navigate(getFollowUpsRoute('missed'))}
      />
    </Box>
  );
};

export default DashboardPage;
