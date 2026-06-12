import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Box } from '@mui/material';
import OverviewDashboard from './dark/OverviewDashboard';
import type { KPIItem, DashboardFilters } from './types';
import { _axios } from 'helper/axios';
import { LeadRecord } from './types';
import { buildDashboardMetrics, applyDashboardFilters, getAvailableAgents } from './dashboardUtils';

const fetchPixelEyeLeads = async (): Promise<LeadRecord[]> => {
  const response = await _axios('get', '/pixeleye');
  if (Array.isArray(response)) return response as LeadRecord[];
  if (Array.isArray(response?.data)) return response.data as LeadRecord[];
  return [];
};

const DashboardPage: React.FC = () => {
  const {
    data: allLeads = [],
    isLoading,
    isError,
  } = useQuery<LeadRecord[]>(['pixelEyeLeads'], fetchPixelEyeLeads, {
    staleTime: 3 * 60 * 1000,
    refetchOnMount: 'always',
  });

  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: '',
    dateTo: '',
    agent: '',
  });

  if (isError) {
    return <div style={{ padding: 16 }}>Unable to load dashboard data.</div>;
  }

  const filteredLeads = useMemo(
    () => applyDashboardFilters(allLeads, filters),
    [allLeads, filters],
  );

  const availableAgents = useMemo(() => getAvailableAgents(allLeads), [allLeads]);
  const metrics = buildDashboardMetrics(filteredLeads);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('PixelEye - Leads payload', allLeads);
    // eslint-disable-next-line no-console
    console.debug('PixelEye - Filtered leads', filteredLeads);
    // eslint-disable-next-line no-console
    console.debug('PixelEye - Computed metrics', metrics);
  }

  const kpiItems: KPIItem[] = [
    {
      key: 'total',
      label: 'Total Leads',
      value: metrics.kpis?.totalLeads ?? 0,
      icon: 'mdi:account-multiple',
      color: 'primary',
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: metrics.kpis?.contactedLeads ?? 0,
      icon: 'mdi:phone',
      color: 'success',
    },
    {
      key: 'appointments',
      label: 'Appointments',
      value: metrics.kpis?.appointments ?? 0,
      icon: 'mdi:calendar-check',
      color: 'warning',
    },
    {
      key: 'lost',
      label: 'Lost',
      value: metrics.kpis?.lostLeads ?? 0,
      icon: 'mdi:close-circle',
      color: 'error',
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
        loading={isLoading}
        topKpiItems={kpiItems}
        filters={filters}
        availableAgents={availableAgents}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </Box>
  );
};

export default DashboardPage;
