import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

interface PortalPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PortalPageHeader = ({ title, subtitle, action }: PortalPageHeaderProps) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
    <Box>
      <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 800, color: TEXT_DARK, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mt: 0.5 }}>{subtitle}</Typography>
      )}
    </Box>
    {action}
  </Stack>
);

export default PortalPageHeader;
