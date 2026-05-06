import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Drawer: Components<Omit<Theme, 'components'>>['MuiDrawer'] = {
  styleOverrides: {
    root: {
      '&:hover, &:focus': {
        '*::-webkit-scrollbar, *::-webkit-scrollbar-thumb': {
          visibility: 'visible',
        },
      },
      '*::-webkit-scrollbar-track': {
        marginTop: 0,
      },
      // Override scrollbar thumb inside dark sidebar
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(195,230,211,0.3)',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: 'rgba(195,230,211,0.6)',
      },
    },
    paper: {
      padding: 0,
      height: '100vh',
      width: 240,
      border: 0,
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    },
  },
};

export default Drawer;
