import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Select: Components<Omit<Theme, 'components'>>['MuiSelect'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      '&.MuiInputBase-root': {
        // In dark mode, restore the background set by InputBase (transparent hides it)
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2420 !important' : 'transparent !important',
      },
      '& .MuiBox-root': {
        fontSize: theme.typography.h4.fontSize,
      },
    }),
    select: ({ theme }) => ({
      padding: theme.spacing(1),
      paddingLeft: theme.spacing(1.25),
      paddingRight: '0 !important',
      backgroundColor: 'transparent !important',
      fontSize: theme.typography.caption.fontSize,
      color: theme.palette.mode === 'dark' ? '#EAF7EE' : theme.palette.text.primary,
      fontWeight: 600,
    }),
    icon: ({ theme }) => ({
      color: theme.palette.mode === 'dark' ? '#8A9C8D' : undefined,
    }),
  },
};

export default Select;
