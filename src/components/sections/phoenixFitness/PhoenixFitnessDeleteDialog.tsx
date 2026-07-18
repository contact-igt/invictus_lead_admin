import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { PhoenixFitnessLead } from 'types/phoenixFitness';

interface PhoenixFitnessDeleteDialogProps {
  open: boolean;
  lead: PhoenixFitnessLead | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PhoenixFitnessDeleteDialog = ({
  open,
  lead,
  isLoading,
  onClose,
  onConfirm,
}: PhoenixFitnessDeleteDialogProps) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle fontWeight={750}>Delete lead?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This will permanently delete the Phoenix Fitness lead for &quot;{lead?.name || 'this lead'}&quot;.
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button color="inherit" variant="outlined" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        color="error"
        variant="contained"
        onClick={onConfirm}
        disabled={isLoading || !lead}
        startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : undefined}
      >
        {isLoading ? 'Deleting...' : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default PhoenixFitnessDeleteDialog;

