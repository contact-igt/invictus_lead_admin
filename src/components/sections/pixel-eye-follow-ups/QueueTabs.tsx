import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { Text } from 'components/ui';
import useTokens from 'hooks/useTokens';
import { font, motion, radius } from 'theme/tokens';
import { queueIcon, queueTone, type FollowUpBucketKey } from './queueTones';

export interface QueueTabItem {
  key: FollowUpBucketKey;
  label: string;
  count: number;
}

export interface QueueTabsProps {
  items: QueueTabItem[];
  active: FollowUpBucketKey;
  onSelect: (key: FollowUpBucketKey) => void;
}

/**
 * Horizontal queue selector.
 *
 * Replaces the right-hand panel of stacked buttons: navigation now sits
 * directly above the list it drives instead of last in reading order, which
 * also frees the third column and lets the list/detail panes breathe.
 *
 * Scrolls horizontally inside its own container so the page never scrolls
 * sideways on narrow viewports.
 */
export const QueueTabs = ({ items, active, onSelect }: QueueTabsProps) => {
  const t = useTokens();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Keep the selected queue in view when it changes from elsewhere (KPI cards,
  // deep links) rather than leaving it scrolled off-screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <Box
      role="tablist"
      aria-label="Follow-up queues"
      sx={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        pb: '4px',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { background: t.border, borderRadius: 2 },
      }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        const tone = queueTone[item.key];
        const palette =
          tone === 'accent'
            ? { fg: t.accentText, bg: t.accentSoft, border: t.accentSoftBorder }
            : t[tone];

        return (
          <Box
            key={item.key}
            component="button"
            type="button"
            role="tab"
            aria-selected={isActive}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(item.key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
              px: '12px',
              height: 38,
              cursor: 'pointer',
              borderRadius: `${radius.control}px`,
              fontFamily: font.sans,
              backgroundColor: isActive ? t.accentSoft : t.surface,
              border: `1px solid ${isActive ? t.accentSoftBorder : t.border}`,
              transition: `background-color ${motion.hover}, border-color ${motion.hover}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              '&:hover': {
                backgroundColor: isActive ? t.accentSoft : t.surfaceSunken,
                borderColor: isActive ? t.accentSoftBorder : t.borderStrong,
              },
              '&:focus-visible': { outline: `2px solid ${t.borderFocus}`, outlineOffset: 2 },
            }}
          >
            <IconifyIcon
              icon={queueIcon[item.key]}
              width={15}
              height={15}
              aria-hidden="true"
              style={{ color: isActive ? t.accentText : palette.fg, flexShrink: 0 }}
            />
            <Text
              variant="label"
              sx={{
                color: isActive ? t.accentText : t.ink,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Text>
            <Box
              component="span"
              sx={{
                minWidth: 20,
                px: '5px',
                borderRadius: `${radius.pill}px`,
                backgroundColor: isActive ? t.accent : t.surfaceSunken,
                color: isActive ? '#FFFFFF' : t.inkSecondary,
                fontFamily: font.mono,
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: '18px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {item.count.toLocaleString()}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default QueueTabs;
