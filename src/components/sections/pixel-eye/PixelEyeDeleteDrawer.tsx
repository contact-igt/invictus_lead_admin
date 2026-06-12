import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { PixelEyeRow } from './pixelEyeTable';

interface PixelEyeDeleteDrawerProps {
  open: boolean;
  lead?: PixelEyeRow | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PixelEyeDeleteDrawer = ({
  open,
  lead,
  isLoading,
  onClose,
  onConfirm,
}: PixelEyeDeleteDrawerProps) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: '100%', sm: 460 },
        maxWidth: '100%',
        background: '#0f1b16',
        color: '#f4fbf6',
        borderLeft: '1px solid rgba(248, 113, 113, 0.22)',
      },
    }}
    ModalProps={{
      BackdropProps: {
        sx: { backgroundColor: 'rgba(2, 8, 6, 0.68)' },
      },
    }}
  >
    <Stack direction="column" sx={{ height: '100%' }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(248, 113, 113, 0.18)' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Delete Lead
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: '#b7c7bd' }}>
            This action cannot be undone.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#cfe2d5' }} aria-label="Close delete drawer">
          <IconifyIcon icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      <Stack direction="column" spacing={2.5} sx={{ flex: 1, px: 3, py: 3, width: '100%' }}>
        <Typography sx={{ color: '#dcebe2', maxWidth: 340, lineHeight: 1.65 }}>
          Are you sure you want to delete this lead? This action cannot be undone.
        </Typography>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: 'rgba(127, 29, 29, 0.24)',
            border: '1px solid rgba(248, 113, 113, 0.26)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 800 }}>
            Lead selected for deletion
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 900, color: '#fff7f7' }}>
            {lead?.customer_name || 'Unnamed Lead'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: '#f3c5c5' }}>
            {lead?.phone_number || 'No phone number'}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="flex-end"
        sx={{
          px: 3,
          py: 2.25,
          backgroundColor: '#0f1b16',
          borderTop: '1px solid rgba(248, 113, 113, 0.18)',
        }}
      >
        <Button onClick={onClose} color="inherit" sx={{ color: '#cfe2d5', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={isLoading || !lead}
          onClick={onConfirm}
          sx={{ textTransform: 'none', fontWeight: 900 }}
        >
          Delete Lead
        </Button>
      </Stack>
    </Stack>
  </Drawer>
);

export default PixelEyeDeleteDrawer;
