import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';
import useColorMode from 'hooks/useColorMode';
import { StatusCategoryItem } from '../types';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface SalesOverviewProps {
  statusBreakdown: StatusCategoryItem[];
  loading?: boolean;
}

const SalesOverview = ({ statusBreakdown, loading = false }: SalesOverviewProps) => {
  const { mode } = useColorMode();
  const chartData = statusBreakdown && statusBreakdown.length > 0 ? statusBreakdown : [];
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
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          itemStyle: { borderColor: mode === 'dark' ? '#0A0F0D' : '#FFFFFF', borderWidth: 2 },
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
    <PixelEyeCard sx={{ p: { xs: 3, md: 4 }, height: '100%', minHeight: 400 }}>
      <div className="flex-1 flex flex-col h-full">
        <div
          className={`mb-6 pb-4 border-b ${mode === 'dark' ? 'border-[#1E2E25]/50' : 'border-gray-200'}`}
        >
          <div
            className={`text-2xl font-black ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Status Distribution
          </div>
          <div
            className={`text-xs font-bold mt-1.5 tracking-widest uppercase ${mode === 'dark' ? 'text-[#4ade80]' : 'text-[#156A45]'}`}
          >
            TOTAL LEADS: {total.toLocaleString()}
          </div>
        </div>

        {loading ? (
          <div
            className={`h-[300px] w-full rounded-2xl animate-pulse ${mode === 'dark' ? 'bg-[#0B1410]' : 'bg-gray-100'}`}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between flex-1">
            <div className="relative w-full sm:w-[280px] h-[280px] flex-shrink-0 flex items-center justify-center">
              <ReactEchart echarts={echarts} option={option} sx={{ height: 280, width: '100%' }} />
            </div>

            <div className="flex-1 w-full min-w-0 flex flex-col gap-2.5">
              {chartData.map((s) => (
                <div
                  key={s.label}
                  title={s.label}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 cursor-pointer group h-[52px] ${
                    mode === 'dark'
                      ? 'bg-[#0B1410]/50 border-[#15271E] hover:bg-[#10241A] hover:border-[#22C55E]/40 hover:shadow-lg hover:shadow-[#22C55E]/5'
                      : 'bg-gray-50/50 border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-lg group-hover:scale-125 transition-transform duration-300"
                      style={{
                        background: s.color,
                        boxShadow: `0 0 15px ${s.color}60`,
                      }}
                    />
                    <div
                      className={`text-sm font-bold truncate transition-colors duration-300 ${
                        mode === 'dark'
                          ? 'text-gray-300 group-hover:text-white'
                          : 'text-gray-700 group-hover:text-emerald-900'
                      }`}
                    >
                      {s.label}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-3 pl-4 tabular-nums">
                    <div
                      className={`text-base font-black ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {s.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PixelEyeCard>
  );
};

export default SalesOverview;
