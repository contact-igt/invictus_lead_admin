import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Button from './Button';

export interface EnterpriseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export const EnterpriseDialog: React.FC<EnterpriseDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryActionLabel = 'Confirm',
  onPrimaryAction,
  secondaryActionLabel = 'Cancel',
  maxWidth = 'sm',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: '20px', // 20px Dialog Spec
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.10)', // Single Shadow Spec
          border: '1px solid #E5E7EB',
          p: 1,
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.875rem', color: '#64748B', fontFamily: '"Geist", sans-serif', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#64748B', p: 0.5 }}>
          <IconifyIcon icon="solar:close-circle-linear" width={22} height={22} />
        </IconButton>
      </DialogTitle>

      {/* Body Content */}
      <DialogContent sx={{ px: 3, py: 2 }}>{children}</DialogContent>

      {/* Footer Actions (Primary action bottom-right) */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>
          {secondaryActionLabel}
        </Button>
        {onPrimaryAction && (
          <Button variant="primary" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnterpriseDialog;
