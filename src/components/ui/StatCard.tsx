import { Box, Stack } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import useTokens from 'hooks/useTokens';
import { density, motion, radius } from 'theme/tokens';
import Surface from './Surface';
import Text from './Text';
import type { Tone } from './StatusChip';
import Sparkline from './Sparkline';

export interface StatCardProps {
  label: string;
  value: number | string;
  /** Small inline glyph beside the label. Never a tinted chip. */
  icon?: string;
  tone?: Tone;
  /** Signed delta, e.g. "+12.4%". Direction drives the colour. */
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  /** Context under the value — "vs last week", "of all-time volume". */
  caption?: string;
  /** A second figure that earns the card its height. */
  secondary?: { label: string; value: string | number };
  sparkline?: number[];
  /** 0–100. Renders a hairline under the value, not a detached footer rail. */
  progress?: number;
  /** Selected state when the card doubles as a filter. */
  active?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const Shimmer = ({ w, h }: { w: number | string; h: number }) => {
  const t = useTokens();
  return (
    <Box
      sx={{
        width: w,
        height: h,
        borderRadius: '4px',
        backgroundImage: `linear-gradient(90deg, ${t.surfaceSunken} 25%, ${t.border} 50%, ${t.surfaceSunken} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'invictusShimmer 1.4s linear infinite',
        '@keyframes invictusShimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  );
};

/**
 * Metric tile.
 *
 * Deliberately not the admin-template shape: no tinted icon square, no status
 * pill. The number is the loudest thing in the card; the label is small
 * tracked uppercase above it, and selection is carried by the card's own
 * border and fill rather than a "Viewing" badge.
 */
export const StatCard = ({
  label,
  value,
  icon,
  tone = 'accent',
  trend,
  trendDirection = 'flat',
  caption,
  secondary,
  sparkline,
  progress,
  active = false,
  loading = false,
  onClick,
}: StatCardProps) => {
  const t = useTokens();
  const palette =
    tone === 'accent'
      ? { fg: t.accentText, bg: t.accentSoft, border: t.accentSoftBorder }
      : t[tone];

  const formatted = typeof value === 'number' ? value.toLocaleString() : value;
  const isLongText = typeof value === 'string' && value.length > 9;

  const trendTone =
    trendDirection === 'up' ? t.success : trendDirection === 'down' ? t.danger : t.neutral;
  const trendIcon =
    trendDirection === 'up'
      ? 'solar:alt-arrow-up-linear'
      : trendDirection === 'down'
        ? 'solar:alt-arrow-down-linear'
        : 'solar:minus-linear';

  return (
    <Surface
      interactive={Boolean(onClick)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? active : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        p: `${density.cardPadding}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        ...(active
          ? {
              borderColor: t.accentSoftBorder,
              backgroundColor: t.accentSoft,
            }
          : null),
      }}
    >
      {/* Severity edge — the only chrome, and it encodes tone. */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: palette.fg,
          opacity: active ? 1 : 0.32,
        }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" gap="8px">
        <Stack direction="row" alignItems="center" gap="6px" sx={{ minWidth: 0 }}>
          {icon && (
            <IconifyIcon
              icon={icon}
              width={13}
              height={13}
              aria-hidden="true"
              style={{ color: active ? t.accentText : t.inkMuted, flexShrink: 0 }}
            />
          )}
          <Text
            variant="eyebrow"
            tone={active ? 'accent' : 'secondary'}
            truncate
            title={label}
            sx={{ minWidth: 0 }}
          >
            {label}
          </Text>
        </Stack>

        {trend && !loading && (
          <Stack
            direction="row"
            alignItems="center"
            gap="1px"
            sx={{ color: trendTone.fg, flexShrink: 0 }}
          >
            <IconifyIcon icon={trendIcon} width={12} height={12} aria-hidden="true" />
            <Text variant="caption" mono sx={{ color: 'inherit', fontWeight: 600 }}>
              {trend}
            </Text>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" gap="8px">
        {loading ? (
          <Shimmer w={84} h={28} />
        ) : (
          <Text
            variant={isLongText ? 'metricSm' : 'metric'}
            truncate
            title={String(formatted)}
            sx={{ minWidth: 0 }}
          >
            {formatted}
          </Text>
        )}
        {!loading && sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} color={palette.fg} ringColor={active ? t.accentSoft : t.surface} />
        )}
      </Stack>

      {progress !== undefined && !loading && (
        <Box
          aria-hidden="true"
          sx={{
            height: 2,
            borderRadius: `${radius.pill}px`,
            backgroundColor: t.surfaceSunken,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: palette.fg,
              transition: `width ${motion.panel}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        </Box>
      )}

      {!loading && (secondary || caption) && (
        <Stack direction="row" alignItems="baseline" gap="4px" sx={{ minWidth: 0 }}>
          {secondary && (
            <Text variant="caption" mono sx={{ color: t.ink, fontWeight: 600, flexShrink: 0 }}>
              {typeof secondary.value === 'number'
                ? secondary.value.toLocaleString()
                : secondary.value}
            </Text>
          )}
          <Text variant="caption" tone="secondary" truncate title={secondary?.label ?? caption}>
            {secondary ? secondary.label : caption}
          </Text>
        </Stack>
      )}
    </Surface>
  );
};

export default StatCard;
