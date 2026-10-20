import { Box, Stack } from '@mui/material';
import useTokens from 'hooks/useTokens';
import { density } from 'theme/tokens';
import Surface from './Surface';
import Text from './Text';
import type { Tone } from './StatusChip';

export interface StatStripItem {
  key: string;
  label: string;
  value: number | string;
  tone?: Tone;
}

export interface StatStripProps {
  items: StatStripItem[];
  label?: string;
}

/**
 * Dense inline stats on a single surface, divided by hairlines.
 *
 * For secondary telemetry that does not deserve a card each: five integers
 * previously occupied five ~110px tiles with the same visual weight as the
 * page's primary metrics. One strip states them in a fraction of the height
 * and correctly reads as subordinate.
 */
export const StatStrip = ({ items, label }: StatStripProps) => {
  const t = useTokens();

  return (
    <Surface sx={{ p: `${density.cardPadding}px`, minWidth: 0 }}>
      {label && (
        <Text variant="eyebrow" tone="secondary" sx={{ mb: '12px', display: 'block' }}>
          {label}
        </Text>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: `repeat(${items.length}, minmax(0, 1fr))`,
          },
          gap: '1px',
          backgroundColor: t.border,
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {items.map((item) => {
          const palette =
            item.tone && item.tone !== 'accent'
              ? t[item.tone]
              : { fg: item.tone === 'accent' ? t.accentText : t.ink };

          return (
            <Stack
              key={item.key}
              gap="2px"
              sx={{ backgroundColor: t.surface, px: '12px', py: '12px', minWidth: 0 }}
            >
              <Text
                variant="metricSm"
                sx={{ color: item.tone && item.tone !== 'neutral' ? palette.fg : t.ink }}
              >
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </Text>
              <Text variant="caption" tone="secondary" truncate title={item.label}>
                {item.label}
              </Text>
            </Stack>
          );
        })}
      </Box>
    </Surface>
  );
};

export default StatStrip;
