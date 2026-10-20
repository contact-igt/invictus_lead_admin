import React from 'react';
import { Box } from '@mui/material';
import useTokens from 'hooks/useTokens';

export type EnterpriseStatus =
  | 'Healthy'
  | 'Running'
  | 'Pending'
  | 'Completed'
  | 'Draft'
  | 'Critical'
  | 'Needs Review'
  | 'Cancelled';

/** Semantic tone, resolved through theme tokens. 'accent' is the brand emerald. */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

interface StatusChipBaseProps {
  size?: 'sm' | 'md';
}

/** Legacy API: a fixed enterprise status name. */
interface StatusChipByStatusProps extends StatusChipBaseProps {
  status: EnterpriseStatus;
  showDot?: boolean;
  label?: never;
  tone?: never;
  dot?: never;
}

/** Token API: free label with a semantic tone. */
interface StatusChipByToneProps extends StatusChipBaseProps {
  label: string;
  tone?: Tone;
  dot?: boolean;
  status?: never;
  showDot?: never;
}

type StatusChipProps = StatusChipByStatusProps | StatusChipByToneProps;

const STATUS_MAP: Record<
  EnterpriseStatus,
  { bg: string; color: string; border: string; dot: string }
> = {
  Healthy: {
    bg: '#F0FDF4',
    color: '#16A34A',
    border: '#BBF7D0',
    dot: '#16A34A',
  },
  Running: {
    bg: '#EFF6FF',
    color: '#2563EB',
    border: '#BFDBFE',
    dot: '#2563EB',
  },
  Pending: {
    bg: '#FFFBEB',
    color: '#D97706',
    border: '#FDE68A',
    dot: '#F59E0B',
  },
  Completed: {
    bg: '#F0FDF4',
    color: '#16A34A',
    border: '#BBF7D0',
    dot: '#16A34A',
  },
  Draft: {
    bg: '#F1F5F9',
    color: '#64748B',
    border: '#E2E8F0',
    dot: '#64748B',
  },
  Critical: {
    bg: '#FEF2F2',
    color: '#EF4444',
    border: '#FCA5A5',
    dot: '#EF4444',
  },
  'Needs Review': {
    bg: '#FFF7ED',
    color: '#C2410C',
    border: '#FED7AA',
    dot: '#F97316',
  },
  Cancelled: {
    bg: '#F8FAFC',
    color: '#94A3B8',
    border: '#E2E8F0',
    dot: '#94A3B8',
  },
};

export const StatusChip: React.FC<StatusChipProps> = (props) => {
  const t = useTokens();
  const { size = 'md' } = props;
  const isSmall = size === 'sm';

  let config: { bg: string; color: string; border: string; dot: string };
  let text: string;
  let showDot: boolean;

  if (props.label !== undefined) {
    const tone = props.tone ?? 'neutral';
    const palette =
      tone === 'accent'
        ? { fg: t.accentText, bg: t.accentSoft, border: t.accentSoftBorder }
        : t[tone];
    config = { bg: palette.bg, color: palette.fg, border: palette.border, dot: palette.fg };
    text = props.label;
    showDot = props.dot ?? true;
  } else {
    config = STATUS_MAP[props.status] || STATUS_MAP.Draft;
    text = props.status;
    showDot = props.showDot ?? true;
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: isSmall ? 1.25 : 1.5,
        py: isSmall ? 0.25 : 0.5,
        borderRadius: '999px', // 999px Badges Spec
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        width: 'fit-content',
        flexShrink: 0,
      }}
    >
      {showDot && (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: config.dot,
            flexShrink: 0,
          }}
        />
      )}
      <Box
        component="span"
        sx={{
          fontSize: isSmall ? '0.6875rem' : '0.75rem',
          fontWeight: 600,
          color: config.color,
          fontFamily: '"Geist", sans-serif',
          lineHeight: 1,
          letterSpacing: '0.01em',
        }}
      >
        {text}
      </Box>
    </Box>
  );
};

export default StatusChip;
