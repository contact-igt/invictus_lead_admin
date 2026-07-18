import { Box, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { PhoenixFitnessLead } from 'types/phoenixFitness';
import { formatPhoenixFitnessDateTime } from './phoenixFitnessUtils';

interface Props {
  open: boolean;
  lead: PhoenixFitnessLead | null;
  isLoading: boolean;
  onClose: () => void;
}

const PhoenixFitnessViewDrawer = ({ open, lead, isLoading, onClose }: Props) => {
  const item = (label: string, value?: string | null, monospace = false) => (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
      <Typography variant="body1" mt={0.5} sx={{ fontFamily: monospace ? 'monospace' : 'inherit', overflowWrap: 'anywhere' }}>
        {isLoading ? 'Loading...' : value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Drawer anchor="right" open={open} onClose={isLoading ? undefined : onClose} PaperProps={{ sx: { width: { xs: '100vw', sm: 580 }, maxWidth: '100vw' } }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight={750}>Phoenix Fitness Lead</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Read-only enquiry details</Typography>
          </Box>
          <IconButton onClick={onClose} disabled={isLoading} aria-label="Close drawer"><IconifyIcon icon="mdi:close" width={22} /></IconButton>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {item('Name', lead?.name)}
          {item('Mobile Number', lead?.mobile_number)}
          {item('Branch', lead?.branch)}
          {item('IP Address', lead?.ip_address, true)}
          {item('UTM Source', lead?.utm_source)}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {item('Created At', formatPhoenixFitnessDateTime(lead?.created_at))}
          {item('Updated At', formatPhoenixFitnessDateTime(lead?.updated_at))}
        </Box>
      </Box>
    </Drawer>
  );
};

export default PhoenixFitnessViewDrawer;
