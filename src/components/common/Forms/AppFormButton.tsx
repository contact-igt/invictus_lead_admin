import React from 'react';
import { Button } from '@mui/material';
import { ThreeDots } from 'react-loader-spinner'; 

interface AppFormButtonProps {
  isLoading?: boolean;
  label: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  bg?: string;
  onClick?: () => void;
}

const AppFormButton: React.FC<AppFormButtonProps> = ({
  isLoading = false,
  label,
  type = 'submit',
  fullWidth = false,
  variant = 'contained',
  size = 'medium',
  bg = '#1976d2',
  onClick,
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      style={{ marginTop: '20px', background: bg }}
      disabled={isLoading}
      
    >
      {isLoading ? (
        <ThreeDots
          height="30"
          width="30"
          color='#ffffff'
          radius="9"
          ariaLabel="three-dots-loading"
        />
      ) : (
        label
      )}
    </Button>
  );
};

export default AppFormButton;
