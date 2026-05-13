import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2),
      borderRadius: 16,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.customShadows[0],
      transition: 'background-color 200ms ease, box-shadow 200ms ease, transform 150ms ease',
      '&:hover': {
        boxShadow: theme.customShadows[1],
        transform: 'translateY(-4px)',
      },

      '@media (min-width:1200px)': {
        padding: theme.spacing(3),
      },
    }),
  },
};

export default Card;
