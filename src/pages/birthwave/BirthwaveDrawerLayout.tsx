import { ReactNode } from 'react';
import { Box, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

interface BirthwaveDrawerLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
  width?: number;
  ariaLabel?: string;
}

export const BirthwaveFormGrid = ({ children }: { children: ReactNode }) => (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    minWidth: 0,
    '& > *': { minWidth: 0 },
  }}>
    {children}
  </Box>
);

export const BirthwaveFormGridItem = ({ children, fullWidth = false, sx }: { children: ReactNode; fullWidth?: boolean; sx?: object }) => (
  <Box sx={{ minWidth: 0, width: '100%', ...(fullWidth ? { width: '100%' } : {}), ...sx }}>
    {children}
  </Box>
);

const BirthwaveDrawerLayout = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 440,
  ariaLabel,
}: BirthwaveDrawerLayoutProps) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: '100vw', sm: width },
        maxWidth: '100vw',
        bgcolor: 'var(--bw-bg)',
        display: 'flex',
        flexDirection: 'column',
        borderTopLeftRadius: { xs: 0, sm: '16px' },
        borderBottomLeftRadius: { xs: 0, sm: '16px' },
        overflow: 'hidden',
      },
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--bw-text)', lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle && <Typography variant="body2" sx={{ color: 'var(--bw-text-muted)', mt: 0.6 }}>{subtitle}</Typography>}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label={ariaLabel || `Close ${title}`} sx={{ flexShrink: 0 }}>
          <Icon icon="mdi:close" width={22} height={22} />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflowY: 'auto', overflowX: 'hidden', px: { xs: 2.5, sm: 3 }, py: 3, boxSizing: 'border-box' }}>
        {children}
      </Box>
      <Divider />
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.25} justifyContent="flex-end" sx={{ px: { xs: 2.5, sm: 3 }, py: 2.25, flexShrink: 0, bgcolor: 'var(--bw-surface)' }}>
        {footer}
      </Stack>
    </Box>
  </Drawer>
);

export default BirthwaveDrawerLayout;
