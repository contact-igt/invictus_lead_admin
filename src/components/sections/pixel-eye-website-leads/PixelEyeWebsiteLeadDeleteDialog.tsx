import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import type { PixelEyeWebsiteLead } from 'types/pixelEyeWebsiteLead';

interface PixelEyeWebsiteLeadDeleteDialogProps {
  open: boolean;
  lead: PixelEyeWebsiteLead | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const PixelEyeWebsiteLeadDeleteDialog = ({
  open,
  lead,
  onClose,
  onConfirm,
  isLoading,
}: PixelEyeWebsiteLeadDeleteDialogProps) => (
  <Popup open={open} onClose={onClose} showOnClose={false}>
    <ConfirmAlert
      title="Delete website lead?"
      message={`This will permanently delete the PixelEye Website Lead for "${lead?.name || 'this record'}". This action cannot be undone.`}
      onConfirm={onConfirm}
      onCancel={onClose}
      isLoading={isLoading}
    />
  </Popup>
);

export default PixelEyeWebsiteLeadDeleteDialog;
