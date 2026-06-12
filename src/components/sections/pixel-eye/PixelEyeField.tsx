import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material/styles';
import useColorMode from 'hooks/useColorMode';
import { getPixelEyeFieldSx, getPixelEyeMenuProps } from './pixelEyeUi';

type PixelEyeFieldProps = TextFieldProps & {
  minWidth?: number | string;
  fieldSx?: SxProps<Theme>;
  compact?: boolean;
};

const PixelEyeField: React.FC<PixelEyeFieldProps> = ({
  minWidth,
  fieldSx,
  compact = false,
  sx,
  select,
  SelectProps,
  InputLabelProps,
  variant = 'outlined',
  ...props
}) => {
  const { mode } = useColorMode();

  const mergedSx = [
    getPixelEyeFieldSx(mode as 'dark' | 'light'),
    minWidth !== undefined ? { minWidth } : null,
    compact
      ? {
          '& .MuiOutlinedInput-root': {
            height: 34,
            borderRadius: '12px',
          },
          '& .MuiInputBase-input': {
            padding: '8px 10px',
            fontSize: '0.75rem',
          },
          '& .MuiSelect-select': {
            padding: '8px 30px 8px 10px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.75rem',
            transform: 'translate(14px, 8px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -11px) scale(0.75)',
              backgroundColor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
              padding: '0 6px',
              borderRadius: '4px',
            },
          },
          '& .MuiSvgIcon-root, & .MuiSelect-icon': {
            fontSize: '1rem',
          },
        }
      : null,
    fieldSx ?? null,
    sx ?? null,
  ].filter(Boolean) as SxProps<Theme>;

  return (
    <TextField
      {...props}
      select={select}
      variant={variant}
      sx={mergedSx}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={
        select ? { ...getPixelEyeMenuProps(mode as 'dark' | 'light'), ...SelectProps } : SelectProps
      }
    />
  );
};

export const PixelEyeInputField = PixelEyeField;

export const PixelEyeSelectField: React.FC<PixelEyeFieldProps> = (props) => (
  <PixelEyeField {...props} select />
);

export default PixelEyeField;
