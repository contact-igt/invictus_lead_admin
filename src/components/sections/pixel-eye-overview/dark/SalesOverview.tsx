import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';
import useColorMode from 'hooks/useColorMode';
import { StatusCategoryItem, SourceBreakdownItem } from '../types';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';
import IconifyIcon from 'components/base/IconifyIcon';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface SalesOverviewProps {
  statusBreakdown: StatusCategoryItem[];
  sources?: SourceBreakdownItem[];
  loading?: boolean;
}

const SalesOverview = ({ statusBreakdown, sources = [], loading = false }: SalesOverviewProps) => {
  const { mode } = useColorMode();
  const chartData = statusBreakdown;
  const total = chartData.reduce((s, c) => s + c.count, 0);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: mode === 'dark' ? '#0F172A' : '#FFFFFF',
        borderColor: mode === 'dark' ? 'transparent' : '#E5E7EB',
        textStyle: { color: mode === 'dark' ? '#F8FAFC' : '#1F2937', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['62%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderColor: mode === 'dark' ? '#0B1410' : '#FFFFFF', borderWidth: 2 },
          data: chartData.map((s) => ({
            value: s.count,
            name: s.label,
            itemStyle: { color: s.color },
          })),
        },
      ],
    }),
    [chartData, mode],
  );

  return (
    <PixelEyeCard sx={{ p: { xs: 3, md: 3.5 }, height: '100%', minHeight: 380 }}>
      <div className="flex flex-col h-full justify-between">
        {/* Header */}
        <div
          className={`mb-4 pb-3 border-b flex items-center justify-between ${mode === 'dark' ? 'border-[#1E2E25]' : 'border-slate-200'}`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${mode === 'dark' ? 'bg-[#10241A] text-[#4ADE80]' : 'bg-slate-100 text-slate-700'}`}>
              <IconifyIcon icon="solar:settings-minimalistic-bold-duotone" width={18} height={18} />
            </div>
            <h3 className={`text-base font-extrabold tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Status Distribution & Acquisition Sources
            </h3>
          </div>
        </div>

        {loading ? (
          <div
            className={`h-[280px] w-full rounded-xl animate-pulse ${mode === 'dark' ? 'bg-[#07100C]' : 'bg-slate-100'}`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
            {/* Left Half: Status Distribution */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-xs font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Status Distribution
                  </h4>
                  <div className={`text-[10px] font-bold tracking-wider uppercase ${mode === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    TOTAL LEADS: {total.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-[130px] h-[130px] shrink-0 flex items-center justify-center">
                  <ReactEchart echarts={echarts} option={option} sx={{ height: 130, width: '100%' }} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
                  {chartData.map((s) => {
                    const percent = total > 0 ? Math.round((s.count / total) * 100) : 0;
                    return (
                      <div key={s.label} className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className={`truncate text-[11px] font-semibold ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
                          <span className={`font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {s.count.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Half: Lead Source Distribution */}
            <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-5 border-slate-200 dark:border-[#1E2E25]">
              <div className="mb-1">
                <h4 className={`text-xs font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Lead Source Distribution
                </h4>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                {sources.slice(0, 5).map((s) => (
                  <div key={s.source} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className={`truncate text-[11px] font-semibold ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {s.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                      <span className={`font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {s.count.toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold ${mode === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {s.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PixelEyeCard>
  );
};

export default SalesOverview;
