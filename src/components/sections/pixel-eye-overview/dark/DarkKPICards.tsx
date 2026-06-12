import React from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import type { KPIItem } from '../types';

const COLOR_MAP_DARK: Record<string, { bar: string; iconBg: string; icon: string }> = {
  primary: { bar: '#16A34A', iconBg: '#052E16', icon: '#DFFFE3' },
  success: { bar: '#16A34A', iconBg: '#052E16', icon: '#DFFFE3' },
  warning: { bar: '#D97706', iconBg: '#3B2A05', icon: '#FFF7ED' },
  error: { bar: '#DC2626', iconBg: '#3B0F0F', icon: '#FFECEC' },
};

const COLOR_MAP_LIGHT: Record<string, { bar: string; iconBg: string; icon: string }> = {
  primary: { bar: '#16A34A', iconBg: '#D1FAE5', icon: '#065F46' },
  success: { bar: '#16A34A', iconBg: '#D1FAE5', icon: '#065F46' },
  warning: { bar: '#D97706', iconBg: '#FEF3C7', icon: '#92400E' },
  error: { bar: '#DC2626', iconBg: '#FEE2E2', icon: '#991B1B' },
};

const DarkKPICards: React.FC<{ items: KPIItem[]; loading?: boolean }> = ({
  items = [],
  loading = false,
}) => {
  const { mode } = useColorMode();
  const COLOR_MAP = mode === 'dark' ? COLOR_MAP_DARK : COLOR_MAP_LIGHT;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
      {items.map((item) => {
        const style = COLOR_MAP[item.color] ?? COLOR_MAP.primary;
        const value = typeof item.value === 'number' ? item.value.toLocaleString() : item.value;

        return (
          <div
            key={item.key}
            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 ${
              mode === 'dark'
                ? 'border-[#15271E] bg-[#070D0A]'
                : 'border-slate-100 bg-slate-50/50 shadow-sm'
            }`}
            style={{ minHeight: 110 }}
          >
            <div className="flex items-start justify-between w-full">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shadow-sm"
                style={{ background: style.iconBg }}
              >
                <IconifyIcon icon={item.icon} sx={{ fontSize: 20, color: style.icon }} />
              </div>
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: style.bar,
                  boxShadow: `0 0 8px ${style.bar}CC`,
                }}
              />
            </div>

            <div className="mt-4">
              <div
                className={`text-xs font-semibold uppercase tracking-wider block ${
                  mode === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-2xl font-bold mt-1 block ${
                  mode === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {loading ? '—' : value}
              </div>
              {item.subtext && (
                <div
                  className={`text-xs mt-1 truncate ${
                    mode === 'dark' ? 'text-[#4B6356]' : 'text-gray-400'
                  }`}
                >
                  {item.subtext}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DarkKPICards;
