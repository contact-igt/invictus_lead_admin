import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';
import useColorMode from 'hooks/useColorMode';
import { StatusCategoryItem } from '../types';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface SalesOverviewProps {
  statusBreakdown: StatusCategoryItem[];
  loading?: boolean;
}

const SalesOverview = ({ statusBreakdown, loading = false }: SalesOverviewProps) => {
  const { mode } = useColorMode();
  const chartData = statusBreakdown && statusBreakdown.length > 0 ? statusBreakdown : [];
  const total = chartData.reduce((s, c) => s + c.count, 0);

  const option = useMemo(() => ({
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
        data: chartData.map((s) => ({ value: s.count, name: s.label, itemStyle: { color: s.color } })),
      },
    ],
  }), [chartData, mode]);

  return (
    <div 
      className={`h-full flex flex-col rounded-2xl border p-5 transition-all duration-300 ease-in-out hover:-translate-y-0.5 ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-[#111714] to-[#0D1310] border-[#1E2E25] shadow-xl hover:shadow-2xl'
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
      }`}
      style={mode === 'dark' ? { 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(34, 197, 94, 0.03)'
      } : {}}
    >
      <div className="flex-1 flex flex-col">
        <div className={`mb-4 pb-3 border-b ${
          mode === 'dark' ? 'border-[#1E2E25]/50' : 'border-gray-200'
        }`}>
          <div className={`text-xl font-bold ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Status Distribution</div>
          <div className={`text-xs font-semibold mt-1 ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
          }`}>Total {total}</div>
        </div>

        {loading ? (
          <div className={`h-[220px] rounded-lg animate-pulse ${
            mode === 'dark' ? 'bg-[#0B1410]' : 'bg-gray-100'
          }`} />
        ) : (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="relative w-full xl:w-[240px] h-[220px] flex-shrink-0">
              <ReactEchart echarts={echarts} option={option} sx={{ height: 220, width: '100%' }} />
            </div>

            <div className="flex-1 w-full min-w-0 space-y-2">
              {chartData.map((s, idx) => (
                <div
                  key={s.label}
                  title={s.label}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer group h-[44px] ${
                    mode === 'dark'
                      ? 'bg-[#0B1410] border-[#0F1B16] hover:bg-[#0F1714] hover:border-[#16A34A]/30'
                      : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-300'
                  }`}
                  style={mode === 'dark' ? {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`
                  } : {
                    animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                      style={{ 
                        background: s.color,
                        boxShadow: `0 0 12px ${s.color}40`
                      }} 
                    />
                    <div className={`text-sm font-semibold truncate transition-colors ${
                      mode === 'dark' 
                        ? 'text-white group-hover:text-[#DFFFE3]' 
                        : 'text-gray-900 group-hover:text-green-700'
                    }`}>{s.label}</div>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-3 pl-4 tabular-nums">
                    <div className={`text-sm font-bold ${
                      mode === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{s.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverview;
