import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { VlsEconomicLawsRegistration } from 'types/vlsEconomicLaws';

interface VlsEconomicLawsDeleteDialogProps {
  open: boolean;
  registration: VlsEconomicLawsRegistration | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VlsEconomicLawsDeleteDialog = ({
  open,
  registration,
  isLoading,
  onClose,
  onConfirm,
}: VlsEconomicLawsDeleteDialogProps) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle fontWeight={750}>Delete registration?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This will permanently delete the Economic Laws & Practice registration for &quot;{registration?.name || 'this registration'}&quot;.
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

export default VlsEconomicLawsDeleteDialog;
