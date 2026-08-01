import React from 'react';
import { Box } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

type MiniStatsMetrics = {
  actions?: {
    todayFollowUps?: number;
    notAnswering?: number;
  };
};

// ─── Live monitoring tag (red dot + text) — matches reference screenshot ───────
const LiveTag = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
    <div style={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: '#EF4444',
      animation: 'livePulse 1.8s ease-in-out infinite',
      flexShrink: 0,
    }} />
    <span style={{
      fontSize: '0.6875rem',
      fontWeight: 600,
      color: '#EF4444',
      fontFamily: '"Geist", sans-serif',
      letterSpacing: '0.02em',
    }}>
      Live monitoring
    </span>
    {label && (
      <span style={{
        fontSize: '0.6875rem',
        color: '#94A3B8',
        fontFamily: '"Geist", sans-serif',
      }}>
        · {label}
      </span>
    )}
  </div>
);

const MiniStats: React.FC<{
  metrics?: MiniStatsMetrics;
  loading?: boolean;
  onTodayFollowUpsClick?: () => void;
  onNotAnsweringClick?: () => void;
}> = ({
  metrics = {},
  onTodayFollowUpsClick,
  onNotAnsweringClick,
}) => {
  const { mode } = useColorMode();
  const todayFollowUps = metrics.actions?.todayFollowUps ?? 0;
  const notAnswering   = metrics.actions?.notAnswering   ?? 0;

  const cardStyle = (isClickable: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    cursor: isClickable ? 'pointer' : 'default',
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

      {/* Today's Follow-ups */}
      <Box
        role={onTodayFollowUpsClick ? 'button' : undefined}
        tabIndex={onTodayFollowUpsClick ? 0 : undefined}
        onClick={onTodayFollowUpsClick}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onTodayFollowUpsClick) { e.preventDefault(); onTodayFollowUpsClick(); } }}
      >
        <PixelEyeCard sx={{ p: 3, borderRadius: '18px', height: '100%', minHeight: 130 }}>
          <div style={cardStyle(Boolean(onTodayFollowUpsClick))}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Card Title (15px, 600, #64748B) */}
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: mode === 'dark' ? '#94A3B8' : '#64748B',
                fontFamily: '"Geist", sans-serif',
                letterSpacing: '-0.01em',
              }}>
                Today's Follow-ups
              </div>
              {/* Value (36px, 700, Geist Mono) */}
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                fontFamily: '"Geist Mono", monospace',
                color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: 6,
              }}>
                {todayFollowUps.toLocaleString()}
              </div>
              <LiveTag label="Scheduled for today" />
            </div>

            {/* Icon (18px inside 40px rounded box) */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: mode === 'dark' ? '#052E16' : '#F0FDF4',
              border: mode === 'dark' ? '1px solid rgba(20,83,45,0.3)' : '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 16,
            }}>
              <IconifyIcon
                icon="solar:calendar-mark-linear"
                width={20}
                height={20}
                sx={{ fontSize: 20, color: mode === 'dark' ? '#4ADE80' : '#16A34A' }}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: todayFollowUps > 0 ? '65%' : '12%', background: '#16A34A', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </PixelEyeCard>
      </Box>

      {/* Not Answering */}
      <Box
        role={onNotAnsweringClick ? 'button' : undefined}
        tabIndex={onNotAnsweringClick ? 0 : undefined}
        onClick={onNotAnsweringClick}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onNotAnsweringClick) { e.preventDefault(); onNotAnsweringClick(); } }}
      >
        <PixelEyeCard sx={{ p: 3, borderRadius: '18px', height: '100%', minHeight: 130 }}>
          <div style={cardStyle(Boolean(onNotAnsweringClick))}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Card Title (15px, 600, #64748B) */}
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: mode === 'dark' ? '#94A3B8' : '#64748B',
                fontFamily: '"Geist", sans-serif',
                letterSpacing: '-0.01em',
              }}>
                Not Answering
              </div>
              {/* Value (36px, 700, Geist Mono) */}
              <div style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                fontFamily: '"Geist Mono", monospace',
                color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginTop: 6,
              }}>
                {notAnswering.toLocaleString()}
              </div>
              <LiveTag label="Requires attention" />
            </div>

            {/* Icon */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: mode === 'dark' ? '#3B1F05' : '#FFF7ED',
              border: mode === 'dark' ? '1px solid rgba(124,45,18,0.3)' : '1px solid #FED7AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 16,
            }}>
              <IconifyIcon
                icon="solar:phone-calling-linear"
                width={20}
                height={20}
                sx={{ fontSize: 20, color: mode === 'dark' ? '#FB923C' : '#C2410C' }}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: notAnswering > 0 ? '75%' : '12%', background: '#EF4444', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </PixelEyeCard>
      </Box>
    </div>
  );
};

export default MiniStats;
