import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { VlsMactMasterClassRegistration } from 'types/vlsMactMasterClass';

interface VlsMactMasterClassDeleteDialogProps {
  open: boolean;
  registration: VlsMactMasterClassRegistration | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VlsMactMasterClassDeleteDialog = ({
  open,
  registration,
  isLoading,
  onClose,
  onConfirm,
}: VlsMactMasterClassDeleteDialogProps) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle fontWeight={750}>Delete registration?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This will permanently delete the MACT Master Class registration for &quot;{registration?.name || 'this registration'}&quot;.
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button color="inherit" variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isLoading || !registration} startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : undefined}>
        {isLoading ? 'Deleting...' : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default VlsMactMasterClassDeleteDialog;
