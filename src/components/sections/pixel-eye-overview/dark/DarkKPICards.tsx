import React from 'react';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import type { KPIItem, EnterpriseStatus } from '../types';

// ─── Enterprise Status Taxonomy Styles ────────────────────────────────────────
const STATUS_STYLES: Record<EnterpriseStatus, { bg: string; color: string; border: string }> = {
  Healthy:      { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  Running:      { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  Pending:      { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  Completed:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Needs Review': { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  Critical:     { bg: '#FEF2F2', color: '#EF4444', border: '#FCA5A5' },
  Draft:        { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
};

// ─── Micro SVG Sparkline Curve ──────────────────────────────────────────────
const Sparkline: React.FC<{ data?: number[]; color?: string }> = ({
  data = [14, 18, 16, 24, 22, 30, 28],
  color = '#16A34A',
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const height = 28;
  const width = 80;

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

const COLORS_LIGHT: Record<string, { iconBg: string; iconColor: string; bar: string }> = {
  primary: { iconBg: '#EFF6FF', iconColor: '#2563EB', bar: '#2563EB' },
  success: { iconBg: '#F0FDF4', iconColor: '#16A34A', bar: '#16A34A' },
  warning: { iconBg: '#FFFBEB', iconColor: '#D97706', bar: '#F59E0B' },
  error:   { iconBg: '#FEF2F2', iconColor: '#EF4444', bar: '#EF4444' },
  info:    { iconBg: '#EFF6FF', iconColor: '#2563EB', bar: '#2563EB' },
};

const COLORS_DARK: Record<string, { iconBg: string; iconColor: string; bar: string }> = {
  primary: { iconBg: '#1E293B', iconColor: '#60A5FA', bar: '#2563EB' },
  success: { iconBg: '#052E16', iconColor: '#4ADE80', bar: '#16A34A' },
  warning: { iconBg: '#3B2A05', iconColor: '#FCD34D', bar: '#F59E0B' },
  error:   { iconBg: '#3B0F0F', iconColor: '#FCA5A5', bar: '#EF4444' },
  info:    { iconBg: '#1E293B', iconColor: '#60A5FA', bar: '#2563EB' },
};

const DarkKPICards: React.FC<{ items: KPIItem[]; loading?: boolean }> = ({
  items = [],
  loading = false,
}) => {
  const { mode } = useColorMode();
  const COLORS = mode === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  const gridCols = items.length > 4
    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <>
      <style>{`
        @keyframes kpiSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kpi-card {
          animation: kpiSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          transition: transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .kpi-card:hover {
          transform: translateY(-3px) scale(1.015) !important;
          box-shadow: 0 4px 16px rgba(15,23,42,0.06) !important;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className={`grid ${gridCols} gap-4`}>
        {items.map((item, index) => {
          const c = COLORS[item.color] ?? COLORS.primary;
          const statusStyle = item.status ? STATUS_STYLES[item.status] : null;
          const progress = item.progress ?? 100;
          const value = typeof item.value === 'number' ? item.value.toLocaleString() : item.value;
          const isClickable = typeof item.onClick === 'function';

          const cardBg   = mode === 'dark' ? '#0F172A' : '#FFFFFF';
          const cardBdr  = mode === 'dark' ? 'rgba(226,232,240,0.1)' : '#E5E7EB';
          const cardShad = '0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03)';

          return (
            <div
              key={item.key}
              className="kpi-card"
              onClick={item.onClick}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable
                ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.onClick?.(); } }
                : undefined}
              style={{
                animationDelay: `${index * 45}ms`,
                borderRadius: 18, // 18px Card Radius Spec
                background: cardBg,
                border: `1px solid ${cardBdr}`,
                boxShadow: cardShad,
                display: 'flex',
                flexDirection: 'column',
                cursor: isClickable ? 'pointer' : 'default',
                overflow: 'hidden',
              }}
            >
              {/* ── Card body ─────────────────────────────────────── */}
              <div style={{ padding: '20px 22px 16px', flex: 1 }}>

                {/* Top row — icon left, status badge pill right */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  {/* Icon (18px) */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: c.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconifyIcon
                      icon={item.icon || 'solar:chart-square-linear'}
                      width={18}
                      height={18}
                      style={{ color: c.iconColor }}
                      sx={{ color: `${c.iconColor} !important`, fontSize: '18px !important', width: 18, height: 18 }}
                    />
                  </div>

                  {/* Strict Status Taxonomy Pill */}
                  {statusStyle && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 3,
                      paddingBottom: 3,
                      borderRadius: 999, // 999px badge spec
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: statusStyle.color,
                        fontFamily: '"Geist", sans-serif',
                        lineHeight: 1,
                      }}>
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Title (15px, 600, #64748B) */}
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                  marginBottom: 6,
                  fontFamily: '"Geist", sans-serif',
                  letterSpacing: '-0.01em',
                }}>
                  {item.label}
                </div>

                {/* Main Metric Value (36px, 700, Geist Mono) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 10,
                }}>
                  <div style={{
                    fontSize: '2.25rem', // 36px Spec
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontFamily: '"Geist Mono", "JetBrains Mono", monospace',
                    color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.02em',
                  }}>
                    {loading ? (
                      <div style={{
                        height: 36,
                        width: 80,
                        borderRadius: 8,
                        background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.4s linear infinite',
                      }} />
                    ) : value}
                  </div>

                  {/* Sparkline curve */}
                  {!loading && (
                    <div style={{ flexShrink: 0, opacity: 0.85 }}>
                      <Sparkline
                        data={item.sparklineData || [10, 15, 13, 20, 18, 26, 24]}
                        color={c.iconColor}
                      />
                    </div>
                  )}
                </div>

                {/* Trend & Comparison context */}
                {!loading && (item.trend || item.comparisonText || item.trendText) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {item.trend && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: item.trendDirection === 'down' ? '#EF4444' : '#16A34A',
                        background: item.trendDirection === 'down' ? '#FEF2F2' : '#F0FDF4',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: '"Geist Mono", monospace',
                      }}>
                        {item.trend}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.75rem',
                      color: mode === 'dark' ? '#64748B' : '#94A3B8',
                      fontFamily: '"Geist", sans-serif',
                      fontWeight: 400,
                    }}>
                      {item.comparisonText || item.trendText}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress indicator bar */}
              <div style={{
                height: 3,
                background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: loading ? '0%' : `${Math.min(Math.max(progress, 12), 100)}%`,
                  background: c.bar,
                  transition: 'width 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DarkKPICards;
