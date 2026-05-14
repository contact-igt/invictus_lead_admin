import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 10,
      backgroundColor: theme.palette.mode === 'dark' ? '#1A2420' : '#FFFFFF',
      fontSize: '0.875rem',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'box-shadow 0.18s ease, border-color 0.18s ease',

      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#C2CCC4',
        transition: 'border-color 0.18s ease',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
      '&.Mui-focused': {
        boxShadow: theme.palette.mode === 'dark'
          ? '0 0 0 3px rgba(46,139,87,0.18)'
          : '0 0 0 3px rgba(46,139,87,0.12)',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
      '&.Mui-error.Mui-focused': {
        boxShadow: '0 0 0 3px rgba(224,68,68,0.12)',
      },
      '&.Mui-disabled': {
        backgroundColor: theme.palette.mode === 'dark' ? '#111714' : '#F4F6F5',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E8EDE9',
        },
      },
    }),

    input: ({ theme }) => ({
      padding: '10px 14px',
      height: 20,
      fontSize: '0.875rem',
      color: theme.palette.mode === 'dark' ? '#EAF7EE' : 'inherit',
      '&::placeholder': {
        color: theme.palette.mode === 'dark' ? '#8A9C8D' : '#8A9C8D',
        opacity: 1,
      },
    }),

    sizeSmall: {
      '& .MuiOutlinedInput-input': {
        padding: '7px 12px',
      },
    },
  },
};

export default OutlinedInput;
