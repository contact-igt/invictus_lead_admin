import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Box, Tabs, Tab } from '@mui/material';
import OverviewDashboard from './dark/OverviewDashboard';
import NotificationTracker from 'components/sections/pixel-eye/NotificationTracker';
import type { KPIItem, DashboardFilters } from './types';
import { _axios } from 'helper/axios';
import { LeadRecord } from './types';
import { buildDashboardMetrics, applyDashboardFilters, getAvailableAgents } from './dashboardUtils';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useParams } from 'react-router-dom';
import { normalizeClientKey } from 'utils/clientKey';

const fetchPixelEyeLeads = async (): Promise<LeadRecord[]> => {
  const response = await _axios('get', '/pixeleye');
  if (Array.isArray(response)) return response as LeadRecord[];
  if (Array.isArray(response?.data)) return response.data as LeadRecord[];
  return [];
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();

  const activeClientKey = normalizeClientKey(
    user?.role === 'super-admin' ? (urlClientKey || 'pixeleye') : user?.clientKey,
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'notifications'>('overview');

  const { data: allLeads = [], isLoading, isError } = useQuery<LeadRecord[]>(
    ['pixelEyeLeads'],
    fetchPixelEyeLeads,
    { staleTime: 3 * 60 * 1000, refetchOnMount: 'always' },
  );

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
    [allLeads, filters]
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
    { key: 'total', label: 'Total Leads', value: metrics.kpis?.totalLeads ?? 0, icon: 'mdi:account-multiple', color: 'primary' },
    { key: 'contacted', label: 'Contacted', value: metrics.kpis?.contactedLeads ?? 0, icon: 'mdi:phone', color: 'success' },
    { key: 'appointments', label: 'Appointments', value: metrics.kpis?.appointments ?? 0, icon: 'mdi:calendar-check', color: 'warning' },
    { key: 'lost', label: 'Lost', value: metrics.kpis?.lostLeads ?? 0, icon: 'mdi:close-circle', color: 'error' },
  ];

  const handleApplyFilters = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', agent: '' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', px: 1 }}
      >
        <Tab label="Overview" value="overview" />
        <Tab label="Notification Tracker" value="notifications" />
      </Tabs>

      {activeTab === 'overview' && (
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
      )}

      {activeTab === 'notifications' && (
        <Box sx={{ px: 1 }}>
          <NotificationTracker
            clientKey={user?.role === 'super-admin' ? activeClientKey : undefined}
          />
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
