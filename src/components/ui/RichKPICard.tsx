import React from 'react';
import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusChip, { EnterpriseStatus } from './StatusChip';

export interface RichKPICardProps {
  title: string;
  value: number | string;
  icon: string;
  status?: EnterpriseStatus;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  comparisonText?: string;
  sparklineData?: number[];
  updatedAt?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const Sparkline: React.FC<{ data?: number[]; color?: string }> = ({
  data = [12, 16, 14, 22, 26, 24, 30],
  color = '#16A34A',
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const height = 28;
  const width = 76;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const COLOR_CONFIG = {
  primary: { iconBg: '#EFF6FF', iconColor: '#2563EB', bar: '#2563EB' },
  success: { iconBg: '#F0FDF4', iconColor: '#16A34A', bar: '#16A34A' },
  warning: { iconBg: '#FFFBEB', iconColor: '#D97706', bar: '#F59E0B' },
  error:   { iconBg: '#FEF2F2', iconColor: '#EF4444', bar: '#EF4444' },
  info:    { iconBg: '#EFF6FF', iconColor: '#2563EB', bar: '#2563EB' },
};

export const RichKPICard: React.FC<RichKPICardProps> = ({
  title,
  value,
  icon,
  status,
  trend,
  trendDirection = 'up',
  comparisonText,
  sparklineData = [12, 16, 14, 22, 26, 24, 30],
  updatedAt,
  color = 'primary',
  onClick,
}) => {
  const c = COLOR_CONFIG[color] || COLOR_CONFIG.primary;
  const isClickable = Boolean(onClick);
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Box
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      sx={{
        borderRadius: '18px', // 18px Card Spec
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB', // Slate-200 Border
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)', // Single Shadow Spec
        p: '20px 22px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 250ms ease, box-shadow 250ms ease',
        '&:hover': {
          transform: 'translateY(-3px) scale(1.015)',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box>
        {/* Top row: 18px Icon + Status Chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: c.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconifyIcon
              icon={icon}
              width={18}
              height={18}
              sx={{ color: `${c.iconColor} !important`, fontSize: 18 }}
            />
          </Box>
          {status && <StatusChip status={status} size="sm" />}
        </Box>

        {/* Card Title (15px, 600 weight) */}
        <Typography
          sx={{
            fontSize: '0.9375rem', // 15px Card Heading Spec
            fontWeight: 600,
            color: '#64748B',
            fontFamily: '"Geist", sans-serif',
            letterSpacing: '-0.01em',
            mb: 0.75,
          }}
        >
          {title}
        </Typography>

        {/* 36px Geist Mono Metric Number */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: '2.25rem', // 36px Spec
              fontWeight: 700,
              fontFamily: '"Geist Mono", monospace',
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {formattedValue}
          </Typography>
          <Sparkline data={sparklineData} color={c.iconColor} />
        </Box>
      </Box>

      {/* Footer: Trend + Comparison + Timestamp */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {trend && (
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: trendDirection === 'down' ? '#EF4444' : '#16A34A',
                backgroundColor: trendDirection === 'down' ? '#FEF2F2' : '#F0FDF4',
                px: 0.75,
                py: 0.25,
                borderRadius: '4px',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              {trend}
            </Box>
          )}
          {comparisonText && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#64748B',
                fontFamily: '"Geist", sans-serif',
              }}
            >
              {comparisonText}
            </Typography>
          )}
        </Box>
        {updatedAt && (
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: '#94A3B8',
              fontFamily: '"Geist Mono", monospace',
            }}
          >
            {updatedAt}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RichKPICard;
