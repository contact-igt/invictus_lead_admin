import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import PageHeader from './PageHeader';
import KPIStrip from './KPIStrip';
import SalesOverview from './SalesOverview';
import TotalProfitChart from './TotalProfitChart';
import MiniStats from './MiniStats';
import TrendChart from '../TrendChart';
import PremiumPlanCard from './PremiumPlanCard';
import DarkKPICards from './DarkKPICards';
import FilterBar from './FilterBar';
import type { KPIItem, FunnelStageItem, DashboardFilters } from '../types';
import { PixelEyePageShell } from 'components/sections/pixel-eye/pixelEyeUi';

interface OverviewDashboardProps {
  metrics?: any;
  leads?: any[];
  loading?: boolean;
  topKpiItems?: KPIItem[];
  filters?: DashboardFilters;
  availableAgents?: string[];
  onApplyFilters?: (filters: DashboardFilters) => void;
  onResetFilters?: () => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics = {},
  loading = false,
  topKpiItems,
  filters = { dateFrom: '', dateTo: '', agent: '' },
  availableAgents = [],
  onApplyFilters = () => {},
  onResetFilters = () => {},
}) => {
  const [activeFunnelStage, setActiveFunnelStage] = useState<FunnelStageItem['stage'] | null>(null);
  const mapStageToSeries = (stage?: string | null): 'contacted' | 'converted' | null => {
    if (!stage) return null;
    const s = stage.toLowerCase();
    if (s.includes('contact') || s.includes('lead') || s.includes('interest')) return 'contacted';
    if (s.includes('appoint') || s.includes('visit')) return 'converted';
    return null;
  };
  const kpis = metrics.kpis || { totalLeads: 0, contactedLeads: 0, appointments: 0, lostLeads: 0 };
  const kpiItems = [
    { key: 'total', label: 'Total Leads', value: kpis.totalLeads ?? 0, delta: '' },
    { key: 'contacted', label: 'Contacted', value: kpis.contactedLeads ?? 0, delta: '' },
    { key: 'appointments', label: 'Appointments', value: kpis.appointments ?? 0, delta: '' },
    { key: 'lost', label: 'Lost', value: kpis.lostLeads ?? 0, delta: '' },
  ];

  const sources = metrics.sourceBreakdown || [];
  const statusBreakdown = metrics.statusBreakdown || [];
  const trend = metrics.trend || [];

  return (
    <PixelEyePageShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        <PageHeader
          subtitle="Real-time lead tracking analytics"
          actions={
            <FilterBar
              agents={availableAgents}
              filters={filters}
              onApplyFilters={onApplyFilters}
              onReset={onResetFilters}
            />
          }
        />

        {activeFunnelStage && (
          <Box sx={{ mt: -4, mb: -2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#DFFFE3' }}>
              Filter: <span style={{ fontWeight: 800 }}>{activeFunnelStage}</span>
            </Typography>
            <button
              onClick={() => setActiveFunnelStage(null)}
              className="text-sm text-[#94A3B8] hover:text-white underline underline-offset-4"
            >
              Clear
            </button>
          </Box>
        )}

        {topKpiItems ? (
          <Box>
            <DarkKPICards items={topKpiItems} loading={loading} />
          </Box>
        ) : (
          <KPIStrip items={kpiItems} />
        )}

        <MiniStats metrics={metrics} loading={loading} />

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <TrendChart
              points={trend}
              loading={loading}
              dark
              highlightSeries={mapStageToSeries(activeFunnelStage)}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TotalProfitChart
              points={trend}
              funnel={metrics.funnel}
              loading={loading}
              onStageClick={(s) => setActiveFunnelStage(s)}
              activeStage={activeFunnelStage}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <SalesOverview statusBreakdown={statusBreakdown} loading={loading} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <PremiumPlanCard sources={sources} />
          </Grid>
        </Grid>
      </Box>
    </PixelEyePageShell>
  );
};

export default OverviewDashboard;
