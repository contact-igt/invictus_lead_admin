import React from 'react';
import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Button from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'solar:folder-error-linear',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <Box
      sx={{
        borderRadius: '18px', // 18px Card Spec
        backgroundColor: '#FFFFFF',
        border: '1px dashed #CBD5E1',
        p: { xs: 4, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: 540,
        mx: 'auto',
        my: 4,
      }}
    >
      {/* Icon illustration container */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
        }}
      >
        <IconifyIcon icon={icon} width={32} height={32} sx={{ color: '#64748B' }} />
      </Box>

      {/* Title (22px Section Heading) */}
      <Typography
        variant="h3"
        sx={{
          fontSize: '1.375rem', // 22px Spec
          fontWeight: 600,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          fontFamily: '"Geist", sans-serif',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Description (14px Body) */}
      <Typography
        sx={{
          fontSize: '0.875rem', // 14px Spec
          fontWeight: 400,
          color: '#64748B',
          fontFamily: '"Geist", sans-serif',
          lineHeight: 1.6,
          mb: 3,
        }}
      >
        {description}
      </Typography>

      {/* Action triggers */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="ghost" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EmptyState;
