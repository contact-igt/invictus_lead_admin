import React, { useMemo } from 'react';
import ReactEchart from 'components/base/ReactEchart';
import useColorMode from 'hooks/useColorMode';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { SourceBreakdownItem } from '../types';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

const PremiumPlanCard: React.FC<{ sources?: SourceBreakdownItem[] }> = ({ sources = [] }) => {
  const { mode } = useColorMode();

  return (
    <div
      className={`rounded-[22px] p-8 relative overflow-hidden transition-all duration-300 h-full min-h-[460px] flex flex-col justify-between ${
        mode === 'dark'
          ? 'bg-[#0B1511] border border-[#1E2E25] text-white shadow-2xl hover:shadow-[0_8px_40px_rgba(34,197,94,0.15)]'
          : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-gray-900 shadow-sm hover:shadow-md'
      }`}
      style={
        mode === 'dark'
          ? {
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }
          : {}
      }
    >
      <div className="flex flex-col h-full">
        {/* Title at top */}
        <div className="text-center mb-6">
          <div
            className={`text-2xl font-black ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Lead Source Distribution
          </div>
        </div>

        {/* Chart in center */}
        <div className="flex justify-center items-center mb-8 flex-1">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 220, height: 220 }}
          >
            <div
              className={`absolute inset-0 rounded-full blur-2xl ${
                mode === 'dark'
                  ? 'bg-gradient-to-br from-[#22C55E]/20 to-transparent'
                  : 'bg-gradient-to-br from-green-200/30 to-transparent'
              }`}
            ></div>
            <ReactEchart
              echarts={echarts}
              option={useMemo(
                () => ({
                  backgroundColor: 'transparent',
                  tooltip: {
                    trigger: 'item',
                    backgroundColor: '#0F172A',
                    textStyle: { color: '#FFF' },
                    formatter: '{b}: {c} ({d}%)',
                  },
                  series: [
                    {
                      name: 'Sources',
                      type: 'pie',
                      radius: ['50%', '85%'],
                      center: ['50%', '50%'],
                      avoidLabelOverlap: false,
                      label: { show: false },
                      emphasis: {
                        label: {
                          show: true,
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#fff',
                          position: 'center',
                        },
                        scale: true,
                        scaleSize: 8,
                      },
                      data: sources.map((s) => ({
                        name: s.source,
                        value: s.count,
                        itemStyle: {
                          color: s.color,
                          borderWidth: 3,
                          borderColor: '#0B1511',
                        },
                      })),
                    },
                  ],
                }),
                [sources],
              )}
              style={{ width: 220, height: 220 }}
            />
          </div>
        </div>

        {/* Description below chart */}
        <p
          className={`text-center text-sm font-medium mb-8 ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Top sources driving your leads and conversion.
        </p>

        {/* Source list */}
        <div className="grid grid-cols-1 gap-3">
          {sources.slice(0, 4).map((s) => (
            <div
              key={s.source}
              className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group h-[52px] ${
                mode === 'dark'
                  ? 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                  : 'bg-white/60 border border-transparent hover:bg-white hover:border-emerald-200'
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
                  className={`truncate text-sm font-bold transition-colors duration-300 ${
                    mode === 'dark'
                      ? 'text-gray-300 group-hover:text-white'
                      : 'text-gray-700 group-hover:text-emerald-900'
                  }`}
                >
                  {s.source}
                </div>
              </div>
              <div
                className={`text-base font-black tabular-nums transition-colors duration-300 ml-4 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {s.count}{' '}
                <span
                  className={`text-xs font-black ml-1 ${
                    mode === 'dark' ? 'text-emerald-400 opacity-80' : 'text-emerald-600'
                  }`}
                >
                  {s.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumPlanCard;
