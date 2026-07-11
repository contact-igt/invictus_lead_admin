import { Drawer, Box, Stack, Typography, Divider, Chip, IconButton } from '@mui/material';
import useColorMode from 'hooks/useColorMode';
import IconifyIcon from 'components/base/IconifyIcon';
import type { PixelEyeWebsiteLead } from 'types/pixelEyeWebsiteLead';
import { formatPixelEyeWebsiteLeadDateTime } from './pixelEyeWebsiteLeadUtils';

interface PixelEyeWebsiteLeadViewDrawerProps {
  open: boolean;
  lead: PixelEyeWebsiteLead | null;
  onClose: () => void;
}

const FieldRow = ({ label, value }: { label: string; value?: string | null }) => (
  <Stack direction="column" spacing={0.5}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
    {label === 'Service' && value ? (
      <Chip label={value} size="small" variant="outlined" sx={{ width: 'fit-content' }} />
    ) : (
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
        {value || '-'}
      </Typography>
    )}
  </Stack>
);

const PixelEyeWebsiteLeadViewDrawer = ({ open, lead, onClose }: PixelEyeWebsiteLeadViewDrawerProps) => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 560, md: 620 },
          maxWidth: '100%',
          background: isDark ? '#0f1b16' : '#ffffff',
          color: isDark ? '#f4fbf6' : '#0F172A',
          borderLeft: '1px solid ' + (isDark ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'),
        },
      }}
      ModalProps={{ BackdropProps: { sx: { backgroundColor: 'rgba(2, 8, 6, 0.68)' } } }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(176, 205, 185, 0.14)' : '#E2E8F0',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              Website Lead Details
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: isDark ? '#9fb0a6' : '#64748B' }}>
              Review the PixelEye website enquiry.
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close drawer" sx={{ color: isDark ? '#cfe2d5' : '#64748B' }}>
            <IconifyIcon icon="mdi:close" width={20} />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: isDark ? '#13231d' : '#F8FAFC',
              border: '1px solid',
              borderColor: isDark ? 'rgba(176, 205, 185, 0.14)' : 'rgba(226, 232, 240, 0.8)',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2.5, color: isDark ? '#dcebe2' : '#0F172A', fontWeight: 800 }}>
              Website Enquiry
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <FieldRow label="Name" value={lead?.name} />
              <FieldRow label="Mobile Number" value={lead?.mobile_number} />
              <FieldRow label="Service" value={lead?.service} />
              <FieldRow label="IP Address" value={lead?.ip_address} />
              <FieldRow label="UTM Source" value={lead?.utm_source} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <FieldRow label="Created At" value={formatPixelEyeWebsiteLeadDateTime(lead?.created_at)} />
              <FieldRow label="Updated At" value={formatPixelEyeWebsiteLeadDateTime(lead?.updated_at)} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PixelEyeWebsiteLeadViewDrawer;
