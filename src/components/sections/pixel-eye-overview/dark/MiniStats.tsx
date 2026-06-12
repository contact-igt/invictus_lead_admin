import React from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

type MiniStatsMetrics = {
  actions?: {
    todayFollowUps?: number;
    notAnswering?: number;
  };
};

const MiniStats: React.FC<{ metrics?: MiniStatsMetrics; loading?: boolean }> = ({
  metrics = {},
}) => {
  const { mode } = useColorMode();
  const todayFollowUps = metrics.actions?.todayFollowUps ?? 0;
  const notAnswering = metrics.actions?.notAnswering ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <PixelEyeCard sx={{ p: 3, height: '100%', minHeight: 120 }}>
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-bold tracking-widest uppercase ${
                mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
              }`}
            >
              Today's Follow-ups
            </div>
            <div
              className={`text-3xl font-black mt-2 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {todayFollowUps.toLocaleString()}
            </div>
            <div
              className={`text-xs mt-1 font-medium ${
                mode === 'dark' ? 'text-[#4B6356]' : 'text-gray-400'
              }`}
            >
              Scheduled for today
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 shadow-xl ${
              mode === 'dark'
                ? 'bg-[#052E16] border border-[#14532D]/30'
                : 'bg-emerald-50 border border-emerald-100'
            }`}
          >
            <IconifyIcon
              icon="mdi:calendar-check"
              sx={{ fontSize: 28, color: mode === 'dark' ? '#4ADE80' : '#15803D' }}
            />
          </div>
        </div>
      </PixelEyeCard>

      <PixelEyeCard sx={{ p: 3, height: '100%', minHeight: 120 }}>
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex-1 min-w-0">
            <div
              className={`text-xs font-bold tracking-widest uppercase ${
                mode === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'
              }`}
            >
              Not Answering
            </div>
            <div
              className={`text-3xl font-black mt-2 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {notAnswering.toLocaleString()}
            </div>
            <div
              className={`text-xs mt-1 font-medium ${
                mode === 'dark' ? 'text-[#4B6356]' : 'text-gray-400'
              }`}
            >
              Requires attention
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 shadow-xl ${
              mode === 'dark'
                ? 'bg-[#3B1F05] border border-[#7C2D12]/30'
                : 'bg-orange-50 border border-orange-100'
            }`}
          >
            <IconifyIcon
              icon="mdi:phone-missed"
              sx={{ fontSize: 28, color: mode === 'dark' ? '#FB923C' : '#C2410C' }}
            />
          </div>
        </div>
      </PixelEyeCard>
    </div>
  );
};

export default MiniStats;
