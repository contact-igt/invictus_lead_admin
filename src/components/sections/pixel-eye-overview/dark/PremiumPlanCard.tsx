import React from 'react';
import useColorMode from 'hooks/useColorMode';
import type { SourceBreakdownItem } from '../types';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

const PremiumPlanCard: React.FC<{ sources?: SourceBreakdownItem[] }> = ({ sources = [] }) => {
  const { mode } = useColorMode();
  const totalCount = sources.reduce((s, c) => s + c.count, 0);

  return (
    <PixelEyeCard sx={{ p: { xs: 3, md: 3.5 }, height: '100%', minHeight: 380 }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`mb-5 pb-3 border-b flex items-center justify-between ${mode === 'dark' ? 'border-[#1E2E25]' : 'border-slate-200'}`}>
          <div>
            <h3 className={`text-xl font-extrabold tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Lead Source Distribution
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Top acquisition channels driving conversion
            </p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${mode === 'dark' ? 'bg-[#07100C] border-[#1F3E30] text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            {totalCount.toLocaleString()} Acquisitions
          </span>
        </div>

        {/* Executive Channel Telemetry Table */}
        <div className="flex flex-col justify-between flex-1 gap-3">
          <div className="flex flex-col gap-3">
            {sources.slice(0, 5).map((s) => (
              <div
                key={s.source}
                className={`flex flex-col gap-1.5 p-2.5 rounded-xl border transition-colors ${
                  mode === 'dark'
                    ? 'border-[#15271E] bg-[#070D0A]'
                    : 'border-slate-200/80 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className={`truncate ${mode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {s.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className={`font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {s.count.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({s.percent}%)
                    </span>
                  </div>
                </div>

                {/* Minimal 6px Progress Bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${mode === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.percent}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-3 border-t text-center text-[11px] font-medium ${mode === 'dark' ? 'border-[#1E2E25] text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            Showing top acquisition channels for selected date context
          </div>
        </div>
      </div>
    </PixelEyeCard>
  );
};

export default PremiumPlanCard;
