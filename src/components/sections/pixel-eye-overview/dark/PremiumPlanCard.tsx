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
    className={`rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
      mode === 'dark'
        ? 'prominent-card text-white shadow-2xl hover:shadow-[0_8px_40px_rgba(34,197,94,0.15)]'
        : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-gray-900 shadow-sm hover:shadow-md'
    }`}
    style={mode === 'dark' ? {
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    } : {}}
  >
    <div>
      {/* Title at top */}
      <div className="text-center mb-4">
        <div className={`text-xl font-bold ${
          mode === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Lead Source Distribution</div>
      </div>

      {/* Chart in center */}
      <div className="flex justify-center items-center mb-4">
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <div className={`absolute inset-0 rounded-full blur-xl ${
            mode === 'dark' ? 'bg-gradient-to-br from-[#22C55E]/10 to-transparent' : 'bg-gradient-to-br from-green-200/20 to-transparent'
          }`}></div>
          <ReactEchart
            echarts={echarts}
            option={useMemo(() => ({
              backgroundColor: 'transparent',
              tooltip: { 
                trigger: 'item', 
                backgroundColor: '#0F172A', 
                textStyle: { color: '#FFF' }, 
                formatter: '{b}: {c} ({d}%)' 
              },
              series: [
                {
                  name: 'Sources',
                  type: 'pie',
                  radius: ['45%', '75%'],
                  center: ['50%', '50%'],
                  avoidLabelOverlap: false,
                  label: { show: false },
                  emphasis: { 
                    label: { 
                      show: true, 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: '#fff',
                      position: 'center'
                    },
                    scale: true,
                    scaleSize: 5
                  },
                  data: sources.map((s) => ({ 
                    name: s.source, 
                    value: s.count, 
                    itemStyle: { 
                      color: s.color, 
                      borderWidth: 2, 
                      borderColor: '#0B1410' 
                    } 
                  })),
                },
              ],
            }), [sources])}
            style={{ width: 160, height: 160 }}
          />
        </div>
      </div>

      {/* Description below chart */}
      <p className={`text-center text-sm mb-4 ${
        mode === 'dark' ? 'text-[#DFFFE3]/70' : 'text-gray-600'
      }`}>Top sources driving your leads and conversion.</p>

      {/* Source list */}
      <div className="space-y-2">
        {sources.slice(0, 4).map((s, idx) => (
          <div 
            key={s.source} 
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group h-[44px] ${
              mode === 'dark'
                ? 'bg-white/5 hover:bg-white/8'
                : 'bg-white/60 hover:bg-white'
            }`}
            style={{
              animation: `fadeInUp 0.3s ease ${idx * 0.08}s both`
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
              <div className={`truncate text-sm font-semibold transition-colors ${
                mode === 'dark'
                  ? 'text-white group-hover:text-[#DFFFE3]'
                  : 'text-gray-900 group-hover:text-green-700'
              }`}>{s.source}</div>
            </div>
            <div className={`text-sm font-bold ml-3 ${
              mode === 'dark' ? 'text-[#DFFFE3]' : 'text-gray-900'
            }`}>{s.count} <span className={`text-xs font-semibold ${
              mode === 'dark' ? 'text-[#A7FFB2]' : 'text-green-600'
            }`}>({s.percent}%)</span></div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default PremiumPlanCard;
