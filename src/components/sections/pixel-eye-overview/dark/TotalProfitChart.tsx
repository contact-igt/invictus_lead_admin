import { Skeleton, Box } from '@mui/material';
import useColorMode from 'hooks/useColorMode';
import type { FunnelStageItem } from '../types';
import FunnelBars from './FunnelBars';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

type ConversionPoint = {
  converted?: number;
};

interface TotalProfitChartProps {
  points?: ConversionPoint[];
  funnel?: FunnelStageItem[];
  loading?: boolean;
  onStageClick?: (stage: FunnelStageItem['stage']) => void;
  activeStage?: FunnelStageItem['stage'] | null;
}

const TotalProfitChart = ({
  points = [],
  funnel = [],
  loading = false,
  onStageClick,
  activeStage = null,
}: TotalProfitChartProps) => {
  const { mode } = useColorMode();
  const isEmpty = points.length === 0;
  // Total should be the first stage (Leads) count, not the sum of all stages
  const funnelTotal =
    funnel && funnel.length > 0
      ? funnel[0]?.count ?? 0
      : points.reduce((s: number, p) => s + (p.converted || 0), 0);

  return (
    <PixelEyeCard sx={{ p: { xs: 3, md: 4 }, height: '100%', minHeight: 400 }}>
      <div
        className={`mb-6 flex min-w-0 items-end justify-between gap-4 border-b pb-4 ${
          mode === 'dark' ? 'border-[#1E2E25]/50' : 'border-gray-200'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`text-xs font-black tracking-widest uppercase mb-1.5 ${
              mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
            }`}
          >
            CONVERSION
          </div>
          <div
            className={`truncate text-2xl font-black ${
              mode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Conversion Funnel
          </div>
        </div>
        <div className="shrink-0 text-right flex flex-col items-end">
          <div
            className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
              mode === 'dark' ? 'text-[#4ADE80]' : 'text-emerald-600'
            }`}
          >
            TOTAL
          </div>
          <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-4xl font-black tabular-nums text-transparent leading-none">
            {funnelTotal}
          </div>
        </div>
      </div>

      {/* Funnel list / bars (compact, interactive) */}
      {!loading && funnel && funnel.length > 0 && (
        <Box className="mb-0 flex-1">
          <FunnelBars
            funnel={funnel}
            activeStage={activeStage}
            onStageClick={(s) => onStageClick?.(s)}
          />
        </Box>
      )}

      {loading ? (
        <Skeleton
          variant="rectangular"
          height={200}
          className="rounded-2xl"
          sx={{ bgcolor: mode === 'dark' ? '#0B1410' : '#F3F4F6' }}
        />
      ) : isEmpty ? (
        <div
          className={`flex items-center justify-center h-48 ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}
        >
          No data available
        </div>
      ) : null}
    </PixelEyeCard>
  );
};

export default TotalProfitChart;
