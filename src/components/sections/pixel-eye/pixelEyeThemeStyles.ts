import { SxProps, Theme } from '@mui/material';

export const getFieldSx = (mode: 'dark' | 'light'): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    height: 46,
    backgroundColor: mode === 'dark' ? '#111f19' : '#F8FAFC',
    color: mode === 'dark' ? '#f4fbf6' : '#0F172A',
    borderRadius: '14px',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: mode === 'dark' ? '#14261f' : '#F1F5F9',
    },
    '&.Mui-focused': {
      backgroundColor: mode === 'dark' ? '#14261f' : '#ffffff',
      boxShadow:
        mode === 'dark' ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : '0 0 0 2px rgba(31, 107, 64, 0.15)',
    },
    '& fieldset': {
      borderColor: mode === 'dark' ? 'rgba(176, 205, 185, 0.18)' : 'rgba(226, 232, 240, 0.8)',
    },
    '&:hover fieldset': {
      borderColor: mode === 'dark' ? 'rgba(134, 239, 172, 0.35)' : '#1F6B40',
    },
    '&.Mui-focused fieldset': {
      borderColor: mode === 'dark' ? '#86EFAC' : '#156A45',
      borderWidth: '1px !important',
    },
    '& .MuiInputBase-input': {
      outline: 'none',
      boxShadow: 'none',
      padding: '12px 14px',
      minHeight: 20,
    },
    '& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: mode === 'dark' ? '#a8b8af' : '#64748B',
    fontWeight: 600,
    '&.Mui-focused': {
      color: mode === 'dark' ? '#86EFAC' : '#156A45',
    },
    '&.MuiInputLabel-shrink': {
      color: mode === 'dark' ? '#86EFAC' : '#156A45',
      fontWeight: 800,
    },
  },
  '& .MuiSelect-icon, & .MuiSvgIcon-root': {
    color: mode === 'dark' ? '#a8b8af' : '#64748B',
  },
  '& .MuiFormHelperText-root': {
    color: mode === 'dark' ? '#94A3B8' : '#64748B',
    marginLeft: 0,
  },
});

export const getMenuProps = (mode: 'dark' | 'light') => ({
  PaperProps: {
    sx: {
      maxHeight: 320,
      backgroundColor: mode === 'dark' ? '#111f19' : '#ffffff',
      color: mode === 'dark' ? '#f4fbf6' : '#0F172A',
      border: `1px solid ${mode === 'dark' ? 'rgba(176, 205, 185, 0.16)' : '#E2E8F0'}`,
      borderRadius: 3,
      boxShadow:
        mode === 'dark' ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(15,23,42,0.06)',
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        py: 1.2,
        px: 2,
        '&:hover': {
          backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(31, 107, 64, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(31, 107, 64, 0.08)',
          fontWeight: 700,
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(31, 107, 64, 0.12)',
          },
        },
      },
    },
  },
});

export const getDrawerPaperSx = (mode: 'dark' | 'light') => ({
  width: { xs: '100%', sm: 560, md: 620 },
  maxWidth: '100%',
  background: mode === 'dark' ? '#0f1b16' : '#ffffff',
  color: mode === 'dark' ? '#f4fbf6' : '#0F172A',
  borderLeft: `1px solid ${mode === 'dark' ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'}`,
});

export const getDialogPaperSx = (mode: 'dark' | 'light') => ({
  borderRadius: 4,
  p: 1.5,
  backgroundColor: mode === 'dark' ? '#0f1b16' : '#ffffff',
  color: mode === 'dark' ? '#f4fbf6' : '#0F172A',
  border: `1px solid ${mode === 'dark' ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'}`,
  boxShadow: mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(15,23,42,0.08)',
});
