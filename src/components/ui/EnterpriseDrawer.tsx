import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Button from './Button';

export interface EnterpriseDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  width?: number | string;
}

export const EnterpriseDrawer: React.FC<EnterpriseDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryActionLabel = 'Save Changes',
  onPrimaryAction,
  width = 540,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          borderTopLeftRadius: '20px', // 20px Spec
          borderBottomLeftRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.10)',
          borderLeft: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
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
        <IconButton onClick={onClose} sx={{ color: '#64748B' }}>
          <IconifyIcon icon="solar:close-circle-linear" width={22} height={22} />
        </IconButton>
      </Box>

      {/* Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>{children}</Box>

      {/* Sticky Footer Action Bar */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {onPrimaryAction && (
          <Button variant="primary" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default EnterpriseDrawer;
