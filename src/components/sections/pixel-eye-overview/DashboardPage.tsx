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
  const {
    data: allLeads = [],
    isLoading,
    isError,
  } = usePixelEyeQuery(scopedClientKey, { enabled: hasScopedClientContext });

  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: '',
    dateTo: '',
    agent: '',
  });

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
      icon: 'mdi:account-multiple',
      color: 'primary',
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: metrics.kpis?.contactedLeads ?? 0,
      icon: 'mdi:phone',
      color: 'success',
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'appointments',
      label: 'Appointments',
      value: metrics.kpis?.appointments ?? 0,
      icon: 'mdi:calendar-check',
      color: 'warning',
      onClick: () => navigate(getLeadsRoute()),
    },
    {
      key: 'lost',
      label: 'Lost',
      value: metrics.kpis?.lostLeads ?? 0,
      icon: 'mdi:close-circle',
      color: 'error',
      onClick: () => navigate(getLeadsRoute()),
    },
  ];

  const followUpKpiItems: KPIItem[] = [
    {
      key: 'pending-followups',
      label: 'Pending Follow-ups',
      value: metrics.followUpSummary.pendingFollowUps,
      icon: 'mdi:playlist-clock',
      color: 'primary',
      onClick: () => navigate(getFollowUpsRoute('all')),
    },
    {
      key: 'due-today',
      label: 'Due Today',
      value: metrics.followUpSummary.dueToday,
      icon: 'mdi:calendar-today',
      color: 'warning',
      onClick: () => navigate(getFollowUpsRoute('today')),
    },
    {
      key: 'overdue-missed',
      label: 'Overdue',
      value: metrics.followUpSummary.overdueCount,
      icon: 'mdi:alert-circle-outline',
      color: 'error',
      onClick: () => navigate(getFollowUpsRoute('overdue')),
    },
    {
      key: 'call-done',
      label: 'Call Done',
      value: metrics.followUpSummary.callDone,
      icon: 'mdi:phone-check',
      color: 'success',
      onClick: () => navigate(getFollowUpsRoute('missed')),
    },
    {
      key: 'outcome-pending',
      label: 'Call Received - Outcome Pending',
      value: metrics.followUpSummary.outcomePending,
      icon: 'mdi:clock-outline',
      color: 'warning',
      onClick: () => navigate(getFollowUpsRoute('priority')),
    },
    {
      key: 'outcome-updated',
      label: 'Outcome Updated',
      value: metrics.followUpSummary.outcomeUpdated,
      icon: 'mdi:form-select',
      color: 'primary',
      onClick: () => navigate(getFollowUpsRoute('outcome-updated')),
    },
    {
      key: 'successful-outcomes',
      label: 'Successful Outcomes',
      value: metrics.followUpSummary.successfulOutcomes,
      icon: 'mdi:check-decagram',
      color: 'success',
      onClick: () => navigate(getFollowUpsRoute('successful-outcomes')),
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
