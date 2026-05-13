import React, { useState } from 'react';
import PageHeader from './PageHeader';
import KPIStrip from './KPIStrip';
import RightPanel from './RightPanel';
import SalesOverview from './SalesOverview';
import TotalProfitChart from './TotalProfitChart';
import MiniStats from './MiniStats';
import TrendChart from '../TrendChart';
import PremiumPlanCard from './PremiumPlanCard';
import FollowUpPanel from './FollowUpPanel';
import DarkKPICards from './DarkKPICards';
import FilterBar from './FilterBar';
import useColorMode from 'hooks/useColorMode';
import type { KPIItem, FunnelStageItem, DashboardFilters } from '../types';

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
  const { mode } = useColorMode();

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
    <div className={`flex min-h-screen ${mode === 'dark' ? 'bg-[#0A0F0D] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <PageHeader subtitle="Real-time lead tracking analytics" />
          <FilterBar 
            agents={availableAgents}
            filters={filters}
            onApplyFilters={onApplyFilters}
            onReset={onResetFilters}
          />
        </div>

        {activeFunnelStage && (
          <div className="mt-2 flex items-center gap-3">
            <div className="text-sm text-[#DFFFE3]">Filter: <span className="font-semibold">{activeFunnelStage}</span></div>
            <button onClick={() => setActiveFunnelStage(null)} className="text-sm text-[#94A3B8] hover:text-white">Clear</button>
          </div>
        )}

        {topKpiItems ? (
          <div className="mt-4"><DarkKPICards items={topKpiItems} loading={loading} /></div>
        ) : (
          <KPIStrip items={kpiItems} />
        )}

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="col-span-3">
            <SalesOverview statusBreakdown={statusBreakdown} loading={loading} />
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <MiniStats metrics={metrics} loading={loading} />
            <TotalProfitChart points={trend} funnel={metrics.funnel} loading={loading} onStageClick={(s) => setActiveFunnelStage(s)} activeStage={activeFunnelStage} />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="col-span-3">
            <TrendChart points={trend} loading={loading} dark highlightSeries={mapStageToSeries(activeFunnelStage)} />
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <PremiumPlanCard sources={sources} />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="col-span-5">
            <FollowUpPanel followUps={metrics.followUps} loading={loading} />
          </div>
        </div>
      </div>

      <aside className={`w-72 shrink-0 border-l ${mode === 'dark' ? 'border-[#1E2E25]' : 'border-gray-200'} px-4 py-6`}>
        <RightPanel notifications={[]} actions={metrics.actions} />
      </aside>
    </div>
  );
};

export default OverviewDashboard;
