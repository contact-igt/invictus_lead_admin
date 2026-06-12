import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SxProps, Theme } from '@mui/material/styles';
import useColorMode from 'hooks/useColorMode';
import { getPixelEyeFieldSx } from './pixelEyeUi';
import dayjs, { Dayjs } from 'dayjs';

interface PixelEyeDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  compact?: boolean;
}

const PixelEyeDatePicker: React.FC<PixelEyeDatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled = false,
  fullWidth = false,
  sx,
  compact = false,
}) => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  const handleDateChange = (date: Dayjs | null) => {
    if (date && date.isValid()) {
      onChange(date.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  };

  const dateValue = value ? dayjs(value) : null;
  const minDateValue = minDate ? dayjs(minDate) : undefined;
  const maxDateValue = maxDate ? dayjs(maxDate) : undefined;

  const textFieldSx = [
    getPixelEyeFieldSx(mode as 'dark' | 'light'),
    {
      minWidth: fullWidth ? '100%' : 'auto',
      '& .MuiOutlinedInput-root': compact
        ? {
            height: 34,
            borderRadius: '12px',
            paddingLeft: '4px',
          }
        : {
            paddingLeft: '4px',
          },
      '& .MuiInputBase-input': compact
        ? {
            padding: '8px 10px',
            fontSize: '0.75rem',
          }
        : {},
      '& .MuiInputLabel-root': compact
        ? {
            fontSize: '0.75rem',
            transform: 'translate(14px, 8px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -11px) scale(0.75)',
              backgroundColor: isDark ? '#0B1511' : '#FFFFFF',
              padding: '0 6px',
              borderRadius: '4px',
            },
          }
        : {},
      '& .MuiSvgIcon-root, & .MuiInputAdornment-root .MuiSvgIcon-root': compact
        ? {
            fontSize: '1rem',
          }
        : {},
    },
    sx ?? {},
  ].filter(Boolean) as SxProps<Theme>;

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleDateChange}
      minDate={minDateValue}
      maxDate={maxDateValue}
      disabled={disabled}
      slotProps={{
        textField: {
          fullWidth: fullWidth,
          size: 'small',
          InputLabelProps: { shrink: true },
          sx: textFieldSx,
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              backgroundColor: isDark ? '#0A0F0D' : '#FFFFFF',
              border: `1px solid ${isDark ? '#1E2E25' : '#E2E8F0'}`,
              borderRadius: '20px',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 50px rgba(15,23,42,0.1)',
              marginTop: '8px',
              overflow: 'hidden',
            },
            '& .MuiPickersDay-root': {
              color: isDark ? '#CBD5E1' : '#475569',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: '#22C55E !important',
                color: '#FFFFFF',
              },
              '&.MuiPickersDay-today': {
                border: `1px solid ${isDark ? '#22C55E' : '#16A34A'}`,
              },
            },
            '& .MuiTypography-root': {
              color: isDark ? '#94A3B8' : '#64748B',
              fontWeight: 700,
            },
            '& .MuiPickersCalendarHeader-label': {
              color: isDark ? '#FFFFFF' : '#0F172A',
              fontWeight: 800,
            },
            '& .MuiPickersArrowSwitcher-root .MuiIconButton-root': {
              color: isDark ? '#22C55E' : '#16A34A',
            },
            '& .MuiDayCalendar-weekDayLabel': {
              color: isDark ? '#4ade80' : '#156A45',
              fontWeight: 800,
            },
          },
        },
      }}
    />
  );
};

export default PixelEyeDatePicker;
