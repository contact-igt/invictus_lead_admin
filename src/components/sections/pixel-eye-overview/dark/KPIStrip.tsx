import React from 'react';

interface KPIItem { key: string; label: string; value: number | string; delta?: string }

const KPICard: React.FC<{ item: KPIItem }> = ({ item }) => (
  <div className="rounded-2xl bg-[#111714] border border-[#1E2E25] p-3 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-bold tracking-widest uppercase text-[#94A3B8]">{item.label}</div>
      <div className="w-8 h-8 rounded-md bg-[#0F172A] flex items-center justify-center text-sm font-bold"> </div>
    </div>
    <div className="mt-2">
      <div className="text-2xl font-extrabold text-white">{item.value}</div>
      {item.delta && <div className="text-sm text-[#94A3B8] mt-1">{item.delta}</div>}
    </div>
  </div>
);

const KPIStrip: React.FC<{ items: KPIItem[]; loading?: boolean }> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <KPICard key={it.key} item={it} />
      ))}
    </div>
  );
};

export default KPIStrip;
