import { Card, CardContent, Skeleton, Box } from '@mui/material';
import useColorMode from 'hooks/useColorMode';
import type { FunnelStageItem } from '../types';
import FunnelBars from './FunnelBars';

interface TotalProfitChartProps {
  points?: any[];
  funnel?: FunnelStageItem[];
  loading?: boolean;
  onStageClick?: (stage: FunnelStageItem['stage']) => void;
  activeStage?: FunnelStageItem['stage'] | null;
}

const TotalProfitChart = ({ points = [], funnel = [], loading = false, onStageClick, activeStage = null }: TotalProfitChartProps) => {
  const { mode } = useColorMode();
  const isEmpty = points.length === 0;
  // Total should be the first stage (Leads) count, not the sum of all stages
  const funnelTotal = (funnel && funnel.length > 0) ? (funnel[0]?.count ?? 0) : points.reduce((s: number, p: any) => s + (p.converted || 0), 0);

  return (
    <Card 
      className={`w-full overflow-hidden rounded-2xl border p-5 ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-[#111714] to-[#0D1310] border-[#1E2E25] shadow-xl'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
      sx={mode === 'dark' ? {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(34, 197, 94, 0.03)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 50px rgba(34, 197, 94, 0.05)',
          transform: 'translateY(-2px)'
        }
      } : {}}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <div className={`mb-4 flex min-w-0 items-start justify-between gap-3 border-b pb-3 ${
          mode === 'dark' ? 'border-[#1E2E25]/50' : 'border-gray-200'
        }`}>
          <div className="min-w-0">
            <div className={`text-[11px] font-extrabold tracking-[0.15em] uppercase mb-1 ${
              mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
            }`}>CONVERSION</div>
            <div className={`truncate text-xl font-bold ${
              mode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Conversion Funnel</div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
              mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
            }`}>Total</div>
            <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-3xl font-extrabold tabular-nums text-transparent">{funnelTotal}</div>
          </div>
        </div>

        {/* Funnel list / bars (compact, interactive) */}
        {!loading && funnel && funnel.length > 0 && (
          <Box className="mb-0">
            <FunnelBars funnel={funnel} activeStage={activeStage} onStageClick={(s) => onStageClick?.(s)} />
          </Box>
        )}

        {loading ? (
          <Skeleton variant="rectangular" height={200} className="rounded-lg" sx={{ bgcolor: mode === 'dark' ? '#0B1410' : '#F3F4F6' }} />
        ) : isEmpty ? (
          <div className={`flex items-center justify-center h-48 ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>No data available</div>
        ) : "Priority Lead Queue"}
      </CardContent>
    </Card>
  );
};

export default TotalProfitChart;
