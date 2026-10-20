import type { CSSProperties, ElementType, ReactNode } from 'react';
import { Box } from '@mui/material';
import useTokens from 'hooks/useTokens';
import { font, type } from 'theme/tokens';

type Variant = keyof typeof type;
type Tone = 'ink' | 'secondary' | 'muted' | 'accent' | 'inverse';

export interface TextProps {
  variant?: Variant;
  tone?: Tone;
  /** Renders in Geist Mono with tabular figures. Automatic for metric variants. */
  mono?: boolean;
  uppercase?: boolean;
  truncate?: boolean;
  as?: ElementType;
  children?: ReactNode;
  sx?: Record<string, unknown>;
  style?: CSSProperties;
  title?: string;
}

const DEFAULT_TAG: Record<Variant, ElementType> = {
  pageTitle: 'h1',
  sectionTitle: 'h2',
  cardTitle: 'h3',
  body: 'p',
  label: 'span',
  caption: 'span',
  eyebrow: 'span',
  metric: 'span',
  metricSm: 'span',
};

/**
 * Typography primitive bound to the token scale. Using this instead of raw
 * MUI Typography keeps every page on the same five sizes.
 *
 * Numerals render in Geist Mono with `tabular-nums` so KPI values and table
 * columns align vertically.
 */
export const Text = ({
  variant = 'body',
  tone = 'ink',
  mono,
  uppercase,
  truncate,
  as,
  children,
  sx,
  ...rest
}: TextProps) => {
  const t = useTokens();
  const spec = type[variant];
  const isMetric = variant === 'metric' || variant === 'metricSm';
  const useMono = mono ?? isMetric;
  const isUpper = uppercase ?? variant === 'eyebrow';

  const color =
    tone === 'secondary'
      ? t.inkSecondary
      : tone === 'muted'
        ? t.inkMuted
        : tone === 'accent'
          ? t.accentText
          : tone === 'inverse'
            ? t.inkInverse
            : t.ink;

  return (
    <Box
      component={as || DEFAULT_TAG[variant]}
      sx={{
        margin: 0,
        fontFamily: useMono ? font.mono : font.sans,
        fontSize: spec.size,
        fontWeight: spec.weight,
        letterSpacing: spec.tracking,
        lineHeight: spec.leading,
        color,
        ...(useMono ? { fontVariantNumeric: 'tabular-nums' } : null),
        ...(isUpper ? { textTransform: 'uppercase' } : null),
        ...(truncate
          ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }
          : null),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Text;
