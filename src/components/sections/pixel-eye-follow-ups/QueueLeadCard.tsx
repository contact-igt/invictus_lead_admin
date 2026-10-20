import { Box, Stack } from '@mui/material';
import { StatusChip, Text } from 'components/ui';
import useTokens from 'hooks/useTokens';
import { motion, radius } from 'theme/tokens';
import { queueTone, type FollowUpBucketKey } from './queueTones';

export interface QueueLeadCardProps {
  name?: string | null;
  phone?: string | null;
  status?: string | null;
  agent?: string | null;
  /** Human relative label, e.g. "Overdue by 2 days". */
  timing?: string | null;
  complianceStatus?: string | null;
  outcomePending?: boolean;
  bucket: FollowUpBucketKey;
  selected: boolean;
  onSelect: () => void;
}

const initials = (name?: string | null) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * A single row in the queue list.
 *
 * Selection is carried by a left severity rail plus fill and border, so the
 * active row is unambiguous. The rail colour encodes queue urgency rather
 * than being decorative.
 */
export const QueueLeadCard = ({
  name,
  phone,
  status,
  agent,
  timing,
  complianceStatus,
  outcomePending,
  bucket,
  selected,
  onSelect,
}: QueueLeadCardProps) => {
  const t = useTokens();
  const tone = queueTone[bucket];
  const palette = tone === 'accent' ? { fg: t.accentText } : t[tone];

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-current={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        position: 'relative',
        display: 'flex',
        gap: '12px',
        p: '12px',
        pl: '15px',
        cursor: 'pointer',
        borderRadius: `${radius.control}px`,
        backgroundColor: selected ? t.accentSoft : t.surface,
        border: `1px solid ${selected ? t.accentSoftBorder : t.border}`,
        overflow: 'hidden',
        transition: `background-color ${motion.hover}, border-color ${motion.hover}`,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': {
          backgroundColor: selected ? t.accentSoft : t.surfaceSunken,
          borderColor: selected ? t.accentSoftBorder : t.borderStrong,
        },
        '&:focus-visible': { outline: `2px solid ${t.borderFocus}`, outlineOffset: 2 },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: palette.fg,
          opacity: selected ? 1 : 0.45,
        }}
      />

      <Box
        aria-hidden="true"
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: t.surfaceSunken,
          border: `1px solid ${t.border}`,
          color: t.inkSecondary,
          fontSize: '0.6875rem',
          fontWeight: 600,
        }}
      >
        {initials(name)}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap="8px">
          <Text variant="label" sx={{ fontWeight: 600 }} truncate title={name || undefined}>
            {name || 'Unknown customer'}
          </Text>
          {status && <StatusChip label={status} tone={tone} size="sm" dot={false} />}
        </Stack>

        <Text variant="caption" tone="secondary" mono sx={{ mt: '2px', display: 'block' }}>
          {phone || 'No number'}
        </Text>

        <Stack direction="row" gap="6px" flexWrap="wrap" sx={{ mt: '8px' }}>
          {timing && <StatusChip label={timing} tone="neutral" size="sm" dot={false} />}
          {agent && <StatusChip label={agent} tone="neutral" size="sm" dot={false} />}
          {complianceStatus && (
            <StatusChip label={complianceStatus} tone="danger" size="sm" dot={false} />
          )}
          {outcomePending && <StatusChip label="Outcome pending" tone="warning" size="sm" dot />}
        </Stack>
      </Box>
    </Box>
  );
};

export default QueueLeadCard;
