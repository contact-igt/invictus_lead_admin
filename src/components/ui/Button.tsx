import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface EnterpriseButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'text';
}

export const Button = React.forwardRef<HTMLButtonElement, EnterpriseButtonProps>(
  ({ variant = 'primary', children, sx, ...props }, ref) => {
    let buttonVariantProps: MuiButtonProps = { variant: 'contained', color: 'primary' };
    let customStyles = {};

    switch (variant) {
      case 'primary':
        buttonVariantProps = { variant: 'contained' };
        customStyles = {
          backgroundColor: '#29AF81',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#218D68', boxShadow: 'none' },
        };
        break;
      case 'secondary':
        buttonVariantProps = { variant: 'contained' };
        customStyles = {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E5E7EB',
          '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', boxShadow: 'none' },
        };
        break;
      case 'ghost':
        buttonVariantProps = { variant: 'text' };
        customStyles = {
          backgroundColor: 'transparent',
          color: '#0F172A',
          '&:hover': { backgroundColor: '#F1F5F9' },
        };
        break;
      case 'danger':
        buttonVariantProps = { variant: 'contained' };
        customStyles = {
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#DC2626', boxShadow: 'none' },
        };
        break;
      case 'outline':
        buttonVariantProps = { variant: 'outlined' };
        customStyles = {
          backgroundColor: '#FFFFFF',
          color: '#29AF81',
          borderColor: '#E5E7EB',
          '&:hover': { backgroundColor: '#EAF8F3', borderColor: '#C4EFE1' },
        };
        break;
      case 'text':
        buttonVariantProps = { variant: 'text' };
        customStyles = {
          backgroundColor: 'transparent',
          color: '#64748B',
          '&:hover': { color: '#0F172A', backgroundColor: '#F8FAFC' },
        };
        break;
    }

    return (
      <MuiButton
        ref={ref}
        size="large" // 48px Height Spec
        disableElevation
        {...buttonVariantProps}
        {...props}
        sx={{
          height: 48,
          borderRadius: '12px', // 12px Button Spec
          fontFamily: '"Geist", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none !important',
          px: 3,
          ...customStyles,
          ...sx,
        }}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'EnterpriseButton';
export default Button;
