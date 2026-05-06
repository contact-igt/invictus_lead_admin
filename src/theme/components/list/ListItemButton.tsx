import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const ListItemButton: Components<Omit<Theme, 'components'>>['MuiListItemButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(0.875, 1.5),
      borderRadius: 8,
      transition: 'background-color 0.15s ease, color 0.15s ease',
      // Default hover for light-background contexts (menus, dropdowns)
      '&:hover': {
        backgroundColor: 'rgba(46,139,87,0.06)',
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.lighter,
        '&:hover': {
          backgroundColor: theme.palette.info.darker,  // #C3E6D3
        },
      },
    }),
  },
};

export default ListItemButton;
