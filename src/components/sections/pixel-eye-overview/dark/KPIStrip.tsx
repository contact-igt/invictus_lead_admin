import IconifyIcon from 'components/base/IconifyIcon';
import React from 'react';

interface KPIItem {
  key: string;
  label: string;
  value: number | string;
  delta?: string;
}

const KPICard: React.FC<{ item: KPIItem }> = ({ item }) => (
  <div className="rounded-[22px] bg-[#0F1B16] border border-[#1E2E25] p-5 flex flex-col justify-between h-full min-h-[140px]">
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-bold tracking-widest uppercase text-[#94A3B8]">
        {item.label}
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-sm font-bold flex-shrink-0">
        <IconifyIcon
          icon={
            item.key === 'total'
              ? 'mdi:account-group'
              : item.key === 'contacted'
                ? 'mdi:phone-check'
                : item.key === 'appointments'
                  ? 'mdi:calendar-check'
                  : 'mdi:close-circle'
          }
          sx={{ fontSize: 24, color: '#16A34A' }}
        />
      </div>
    </div>
    <div className="mt-auto">
      <div className="text-3xl font-black text-white">{item.value}</div>
      {item.delta && <div className="text-sm text-[#94A3B8] mt-1">{item.delta}</div>}
    </div>
  </div>
);

const KPIStrip: React.FC<{ items: KPIItem[]; loading?: boolean }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((it) => (
        <KPICard key={it.key} item={it} />
      ))}
    </div>
  );
};

export default KPIStrip;
