import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
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
  primary: {
    iconBgLight: '#EFF6FF',
    iconBgDark: 'rgba(37, 99, 235, 0.2)',
    iconColorLight: '#2563EB',
    iconColorDark: '#60A5FA',
  },
  success: {
    iconBgLight: '#F0FDF4',
    iconBgDark: 'rgba(34, 197, 94, 0.2)',
    iconColorLight: '#16A34A',
    iconColorDark: '#4ADE80',
  },
  warning: {
    iconBgLight: '#FFFBEB',
    iconBgDark: 'rgba(245, 158, 11, 0.2)',
    iconColorLight: '#D97706',
    iconColorDark: '#FBBF24',
  },
  error: {
    iconBgLight: '#FEF2F2',
    iconBgDark: 'rgba(239, 68, 68, 0.2)',
    iconColorLight: '#EF4444',
    iconColorDark: '#F87171',
  },
  info: {
    iconBgLight: '#EFF6FF',
    iconBgDark: 'rgba(37, 99, 235, 0.2)',
    iconColorLight: '#2563EB',
    iconColorDark: '#60A5FA',
  },
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const c = COLOR_CONFIG[color] || COLOR_CONFIG.primary;
  const isClickable = Boolean(onClick);
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  const iconBg = isDark ? c.iconBgDark : c.iconBgLight;
  const iconColor = isDark ? c.iconColorDark : c.iconColorLight;

  return (
    <Box
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      sx={{
        borderRadius: '18px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
        boxShadow: isDark
          ? '0 6px 20px rgba(0, 0, 0, 0.4)'
          : '0 6px 20px rgba(15, 23, 42, 0.05)',
        p: '20px 22px 16px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 250ms ease, box-shadow 250ms ease',
        '&:hover': {
          transform: 'translateY(-3px) scale(1.015)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.6)'
            : '0 6px 20px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box>
        {/* Top row: Icon + Status Chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: iconBg,
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
              sx={{ color: `${iconColor} !important`, fontSize: 18 }}
            />
          </Box>
          {status && <StatusChip status={status} size="sm" />}
        </Box>

        {/* Card Title */}
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: isDark ? '#94A3B8' : '#64748B',
            fontFamily: '"Geist", sans-serif',
            letterSpacing: '-0.01em',
            mb: 0.75,
          }}
        >
          {title}
        </Typography>

        {/* Metric Value + Sparkline */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: '2.25rem',
              fontWeight: 700,
              fontFamily: '"Geist Mono", monospace',
              color: isDark ? '#F8FAFC' : '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {formattedValue}
          </Typography>
          <Sparkline data={sparklineData} color={iconColor} />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: 1,
          pt: 1,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {trend && (
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color:
                  trendDirection === 'up'
                    ? isDark ? '#4ADE80' : '#16A34A'
                    : trendDirection === 'down'
                      ? isDark ? '#F87171' : '#DC2626'
                      : isDark ? '#94A3B8' : '#64748B',
              }}
            >
              {trend}
            </Box>
          )}
          {comparisonText && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: isDark ? '#94A3B8' : '#94A3B8',
                fontWeight: 400,
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
              color: isDark ? '#64748B' : '#94A3B8',
              whiteSpace: 'nowrap',
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
