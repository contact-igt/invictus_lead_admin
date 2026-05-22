import React from 'react';
import useColorMode from 'hooks/useColorMode';
import type { FunnelStageItem } from '../types';

interface FunnelBarsProps {
  funnel: FunnelStageItem[];
  onStageClick?: (stage: FunnelStageItem['stage']) => void;
  activeStage?: FunnelStageItem['stage'] | null;
}

const COLORS = ['#16A34A', '#22C55E', '#60A5FA', '#F59E0B', '#FB7185'];

const FunnelBars: React.FC<FunnelBarsProps> = ({ funnel = [], onStageClick, activeStage = null }) => {
  const { mode } = useColorMode();
  if (!funnel || funnel.length === 0) return null;

  return (
    <div className="space-y-2">
      {funnel.map((f, i) => {
        const isActive = activeStage === f.stage;
        const barColor = COLORS[i % COLORS.length];
        return (
          <button
            key={f.stage}
            type="button"
            onClick={() => onStageClick?.(f.stage)}
            aria-pressed={isActive}
            className={`grid min-h-[48px] w-full grid-cols-[minmax(92px,0.9fr)_minmax(72px,1fr)_auto] items-center gap-3 rounded-xl border p-3 transition-all duration-200 group ${
              mode === 'dark'
                ? 'bg-[#0B1410] border-[#0F1B16] hover:bg-[#0F1714] hover:border-[#16A34A]/30'
                : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-300'
            }`}
            style={mode === 'dark' ? {
              boxShadow: isActive 
                ? '0 0 0 2px rgba(34,197,94,0.2), 0 4px 12px rgba(34,197,94,0.15)' 
                : '0 2px 8px rgba(0, 0, 0, 0.2)',
              borderColor: isActive ? '#16A34A' : '#0F1B16',
              backgroundColor: isActive ? '#0F1714' : '#0B1410',
              animation: `fadeInUp 0.3s ease ${i * 0.05}s both`
            } : {
              boxShadow: isActive ? '0 0 0 2px rgba(34,197,94,0.3)' : 'none',
              borderColor: isActive ? '#16A34A' : undefined,
              backgroundColor: isActive ? '#DCFCE7' : undefined,
              animation: `fadeInUp 0.3s ease ${i * 0.05}s both`
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div 
                className="w-3 h-3 rounded flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform" 
                style={{ 
                  background: barColor,
                  boxShadow: `0 0 12px ${barColor}40`
                }} 
              />
              <div className={`text-sm font-semibold transition-colors ${
                mode === 'dark'
                  ? 'text-white group-hover:text-[#DFFFE3]'
                  : 'text-gray-900 group-hover:text-green-700'
              } truncate`}>{f.stage}</div>
            </div>

            <div className="min-w-0">
              <div className={`w-full h-2.5 rounded-full overflow-hidden shadow-inner ${
                mode === 'dark' ? 'bg-[#072015]' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(1, f.percent)}%`,
                    background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}CC 100%)`,
                    boxShadow: `0 0 8px ${barColor}60`
                  }}
                />
              </div>
            </div>

            <div className="min-w-[74px] text-right tabular-nums">
              <div className={`text-sm font-bold ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{f.count} <span className={`text-xs font-semibold ${
                mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
              }`}>({f.percent}%)</span></div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FunnelBars;
