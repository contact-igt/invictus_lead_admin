import React, { useState } from 'react';
import useColorMode from 'hooks/useColorMode';
import type { FollowUpMetrics, FollowUpReminder } from '../types';

const relativeLabel = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === -1) return '1 day overdue';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

const LeadRow = ({ lead, accent, mode }: { lead: FollowUpReminder; accent: string; mode: 'light' | 'dark' }) => (
  <div className={`flex items-center gap-3 p-3 rounded-md transition-colors h-[68px] ${
    mode === 'dark' ? 'hover:bg-[#0F1714]' : 'hover:bg-gray-100'
  }`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
      mode === 'dark' ? 'bg-[#052E16]' : 'bg-green-100 text-green-700'
    }`}>{(lead.customer_name||'U').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold truncate ${
        mode === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>{lead.customer_name}</div>
      <div className={`text-xs truncate ${
        mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
      }`}>{lead.phone_number} • {lead.agent_name}</div>
      <div className="text-xs font-semibold mt-1" style={{color: accent}}>{relativeLabel(lead.daysRelative)} — {lead.follow_up_date}</div>
    </div>
  </div>
);

const FollowUpPanel: React.FC<{ followUps: FollowUpMetrics; loading?: boolean }> = ({ followUps, loading = false }) => {
  const { mode } = useColorMode();
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const tabs = [
    { key: 'overdue', label: 'Overdue', count: followUps.overdueCount, leads: followUps.overdueLeads, accent: '#DC2626' },
    { key: 'today', label: 'Today', count: followUps.todayCount, leads: followUps.todayLeads, accent: '#D97706' },
    { key: 'week', label: 'This Week', count: followUps.upcomingCount, leads: followUps.upcomingLeads, accent: '#16A34A' },
  ];

  const active = tabs[tab];

  return (
    <div className={`rounded-2xl border p-4 ${
      mode === 'dark' ? 'bg-[#0B1410] border-[#0F1B16]' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`text-[11px] font-bold tracking-widest uppercase ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>Follow-up Reminders</div>
          <div className={`text-lg font-semibold ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Scheduled Actions</div>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((t, i) => (
            <button 
              key={t.key} 
              onClick={() => setTab(i as 0 | 1 | 2)} 
              className={`px-3 py-1 rounded-md text-sm font-semibold ${
                i===tab 
                  ? (mode === 'dark' ? 'bg-[#11281F] text-white' : 'bg-green-100 text-green-800')
                  : (mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600')
              }`}
            >
              {t.label} {t.count > 0 && <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                mode === 'dark' ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-gray-200'
              }`}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3">
            <div className={`h-10 rounded-md animate-pulse ${
              mode === 'dark' ? 'bg-[#07120E]' : 'bg-gray-100'
            }`} />
            <div className={`h-10 rounded-md animate-pulse ${
              mode === 'dark' ? 'bg-[#07120E]' : 'bg-gray-100'
            }`} />
            <div className={`h-10 rounded-md animate-pulse ${
              mode === 'dark' ? 'bg-[#07120E]' : 'bg-gray-100'
            }`} />
          </div>
        ) : active.leads.length > 0 ? (
          <div className="space-y-2">
            {active.leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} accent={active.accent} mode={mode} />
            ))}
          </div>
        ) : (
          <div className={`text-sm py-4 text-center ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>No follow-ups in this view.</div>
        )}
      </div>
    </div>
  );
};

export default FollowUpPanel;
