import React from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';

const MiniStats: React.FC<{ metrics?: any; loading?: boolean }> = ({ metrics = {}}) => {
  const { mode } = useColorMode();
  const todayFollowUps = metrics.actions?.todayFollowUps ?? 0;
  const notAnswering = metrics.actions?.notAnswering ?? 0;

  return (
    <div className="space-y-2">
      <div className={`rounded-2xl border p-3 flex items-center justify-between h-[88px] ${
        mode === 'dark' ? 'bg-[#0B1410] border-[#0F1B16]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold tracking-widest uppercase ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>Today's Follow-ups</div>
          <div className={`text-lg font-extrabold ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{todayFollowUps.toLocaleString()}</div>
          <div className={`text-sm mt-1 ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
          }`}>Scheduled for today</div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
          mode === 'dark' ? 'bg-[#052E16] text-white' : 'bg-green-100 text-green-700'
        }`}>
          <IconifyIcon icon="mdi:calendar-check" sx={{ fontSize: 18, color: mode === 'dark' ? '#DFFFE3' : '#15803D' }} />
        </div>
      </div>

      <div className={`rounded-2xl border p-3 flex items-center justify-between h-[88px] ${
        mode === 'dark' ? 'bg-[#0B1410] border-[#0F1B16]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-bold tracking-widest uppercase ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
          }`}>Not Answering</div>
          <div className={`text-lg font-extrabold ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{notAnswering.toLocaleString()}</div>
          <div className={`text-sm mt-1 ${
            mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-600'
          }`}>Requires attention</div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
          mode === 'dark' ? 'bg-[#3B1F05] text-white' : 'bg-orange-100 text-orange-700'
        }`}>
          <IconifyIcon icon="mdi:phone-missed" sx={{ fontSize: 18, color: mode === 'dark' ? '#FFF7ED' : '#C2410C' }} />
        </div>
      </div>
    </div>
  );
};

export default MiniStats;
