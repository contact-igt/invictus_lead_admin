import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import useTokens from 'hooks/useTokens';
import { density } from 'theme/tokens';

/**
 * Page ground + the single vertical rhythm every screen follows:
 *
 *   header → summary → analytics → workspace → detail
 *
 * Bands are separated by one fixed gap so nothing reads as randomly stacked.
 */
export const PageShell = ({ children }: { children: ReactNode }) => {
  const t = useTokens();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: t.canvas,
        color: t.ink,
        px: { xs: '16px', md: '20px', xl: '28px' },
        py: { xs: '16px', md: '20px' },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1680,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: `${density.bandGap}px`,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

/** A single band in the page rhythm. */
export const Band = ({ children }: { children: ReactNode }) => (
  <Box sx={{ minWidth: 0 }}>{children}</Box>
);

/**
 * Metric grid.
 *
 * `featured` widens the first column so the row has a focal point instead of
 * N identical tiles — the leading metric is usually the one that decides what
 * the operator does next.
 */
export const StatGrid = ({
  children,
  columns = 4,
  featured = false,
}: {
  children: ReactNode;
  columns?: 3 | 4;
  featured?: boolean;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: 'minmax(0, 1fr)',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: featured
          ? `1.5fr ${Array.from({ length: columns - 1 }, () => '1fr').join(' ')}`
          : `repeat(${columns}, minmax(0, 1fr))`,
      },
      gap: `${density.gridGap}px`,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);

export default PageShell;
