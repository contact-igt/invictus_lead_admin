import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import KPIStrip from './KPIStrip';
import SalesOverview from './SalesOverview';
import TotalProfitChart from './TotalProfitChart';
import MiniStats from './MiniStats';
import TrendChart from '../TrendChart';
import DarkKPICards from './DarkKPICards';
import FilterBar from './FilterBar';
import type { KPIItem, FunnelStageItem, DashboardFilters } from '../types';
import { PixelEyePageShell } from 'components/sections/pixel-eye/pixelEyeUi';
import useColorMode from 'hooks/useColorMode';

// ─── Section divider matching Enterprise Design Specs ─────────────────────────
const SectionDivider = ({
  label,
  live = false,
}: {
  label: string;
  live?: boolean;
}) => {
  const { mode } = useColorMode();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      {/* Indicator Dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: live ? '#EF4444' : '#2563EB',
          flexShrink: 0,
          ...(live
            ? {
                animation: 'livePulse 1.8s ease-in-out infinite',
              }
            : {}),
        }}
      />
      <h3
        style={{
          fontSize: '1.375rem', // 22px Section Heading Spec
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
          fontFamily: '"Geist", sans-serif',
          margin: 0,
        }}
      >
        {label}
      </h3>
      {/* Soft Horizontal Rule */}
      <div
        style={{
          flex: 1,
          height: 1,
          background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
        }}
      />
    </div>
  );
};

interface OverviewDashboardProps {
  metrics?: any;
  leads?: any[];
  loading?: boolean;
  topKpiItems?: KPIItem[];
  followUpKpiItems?: KPIItem[];
  filters?: DashboardFilters;
  availableAgents?: string[];
  onApplyFilters?: (filters: DashboardFilters) => void;
  onResetFilters?: () => void;
  onTodayFollowUpsClick?: () => void;
  onNotAnsweringClick?: () => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics = {},
  loading = false,
  topKpiItems,
  followUpKpiItems,
  filters = { dateFrom: '', dateTo: '', agent: '' },
  availableAgents = [],
  onApplyFilters = () => {},
  onResetFilters = () => {},
  onTodayFollowUpsClick,
  onNotAnsweringClick,
}) => {
  const { mode } = useColorMode();
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
    { key: 'total',        label: 'Total Leads',  value: kpis.totalLeads ?? 0,       delta: '' },
    { key: 'contacted',    label: 'Contacted',    value: kpis.contactedLeads ?? 0,   delta: '' },
    { key: 'appointments', label: 'Appointments', value: kpis.appointments ?? 0,     delta: '' },
    { key: 'lost',         label: 'Lost',         value: kpis.lostLeads ?? 0,        delta: '' },
  ];

  const sources        = metrics.sourceBreakdown || [];
  const statusBreakdown = metrics.statusBreakdown || [];
  const trend          = metrics.trend || [];

  return (
    <PixelEyePageShell>
      {/* Live pulse keyframe */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

        {/* ── Compact Sticky Header Row (Max 96px, Sticky Top: 0) ─── */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: mode === 'dark' ? '#08110D' : '#F8FAFC',
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: '2rem', // 32px Page Heading Spec
                fontWeight: 700,
                color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.025em',
                fontFamily: '"Geist", sans-serif',
                lineHeight: 1.2,
              }}
            >
              Overview
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.8125rem', // 13px Secondary Spec
                color: mode === 'dark' ? '#94A3B8' : '#64748B',
                mt: 0.25,
                fontFamily: '"Geist", sans-serif',
              }}
            >
              Real-time lead tracking & operational analytics
            </Typography>
          </Box>

          <FilterBar
            agents={availableAgents}
            filters={filters}
            onApplyFilters={onApplyFilters}
            onReset={onResetFilters}
          />
        </Box>

        {/* Active funnel filter indicator */}
        {activeFunnelStage && (
          <Box sx={{ mt: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#DFFFE3' : '#0F172A' }}>
              Filter: <span style={{ fontWeight: 700 }}>{activeFunnelStage}</span>
            </Typography>
            <button
              onClick={() => setActiveFunnelStage(null)}
              style={{
                fontSize: '0.8125rem',
                color: '#64748B',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Clear
            </button>
          </Box>
        )}

        {/* ══ STEP 1: PRIMARY KPIS (Full Width Row) ══════════════════ */}
        <Box>
          <SectionDivider label="Analytics — All Time" />
          {topKpiItems ? (
            <DarkKPICards items={topKpiItems} loading={loading} />
          ) : (
            <KPIStrip items={kpiItems} />
          )}
        </Box>

        {/* ══ STEP 2: SUPPORTING ANALYTICS (7+5 Grid) ══════════════════ */}
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}> {/* 7 Columns Spec */}
              <TrendChart
                points={trend}
                loading={loading}
                dark
                highlightSeries={mapStageToSeries(activeFunnelStage)}
              />
            </Grid>
            <Grid item xs={12} lg={5}> {/* 5 Columns Spec */}
              <TotalProfitChart
                points={trend}
                funnel={metrics.funnel}
                loading={loading}
                onStageClick={(s) => setActiveFunnelStage(s)}
                activeStage={activeFunnelStage}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ══ STEP 3: LIVE OPERATIONS HUB & STATUS / SOURCE DISTRIBUTION (7+5 Grid) ═══ */}
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}> {/* 7 Columns Spec: Live Operations Hub */}
              <div className="flex flex-col gap-4">
                <MiniStats
                  metrics={metrics}
                  loading={loading}
                  onTodayFollowUpsClick={onTodayFollowUpsClick}
                  onNotAnsweringClick={onNotAnsweringClick}
                />
                {followUpKpiItems && followUpKpiItems.length > 0 && (
                  <DarkKPICards items={followUpKpiItems} loading={loading} />
                )}
              </div>
            </Grid>
            <Grid item xs={12} lg={5}> {/* 5 Columns Spec: Status & Source Distribution */}
              <div className="flex flex-col gap-6 h-full">
                <SalesOverview statusBreakdown={statusBreakdown} loading={loading} sources={sources} />
              </div>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </PixelEyePageShell>
  );
};

export default OverviewDashboard;
