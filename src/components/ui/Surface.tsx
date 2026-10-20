import { forwardRef, type ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';
import useTokens from 'hooks/useTokens';
import { density, radius, motion } from 'theme/tokens';

export interface SurfaceProps extends Omit<BoxProps, 'children'> {
  children?: ReactNode;
  /** `card` is the default panel; `sunken` is a well (table header, input row). */
  tone?: 'card' | 'sunken' | 'raised';
  /** Adds hover elevation + pointer. Use only when the whole surface is clickable. */
  interactive?: boolean;
  /** Corner scale. `section` for page-level panels, `card` for tiles. */
  corner?: 'card' | 'section';
  padded?: boolean;
}

/**
 * The one card primitive. Every panel in the app is a Surface so border,
 * radius, fill and elevation can never drift between pages.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, tone = 'card', interactive = false, corner = 'card', padded = false, sx, ...rest }, ref) => {
    const t = useTokens();

    const fill =
      tone === 'sunken' ? t.surfaceSunken : tone === 'raised' ? t.surfaceRaised : t.surface;

    return (
      <Box
        ref={ref}
        sx={{
          backgroundColor: fill,
          border: `1px solid ${t.border}`,
          borderRadius: `${corner === 'section' ? radius.section : radius.card}px`,
          boxShadow: tone === 'sunken' ? 'none' : t.shadowCard,
          ...(padded ? { p: `${density.cardPadding}px` } : null),
          ...(interactive
            ? {
                cursor: 'pointer',
                transition: `border-color ${motion.hover}, box-shadow ${motion.hover}, transform ${motion.hover}`,
                '&:hover': {
                  borderColor: t.borderStrong,
                  boxShadow: t.shadowHover,
                  transform: 'translateY(-1px)',
                },
                '&:focus-visible': {
                  outline: `2px solid ${t.borderFocus}`,
                  outlineOffset: 2,
                },
              }
            : null),
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Box>
    );
  },
);

Surface.displayName = 'Surface';
export default Surface;
