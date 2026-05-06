import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Paper: Components<Omit<Theme, 'components'>>['MuiPaper'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(2.5),
      backgroundColor: theme.palette.info.lighter,  // #FFFFFF
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'none',

      '&.MuiMenu-paper': {
        padding: 0,
        borderRadius: 10,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.customShadows[0],
      },

      '&.MuiPopover-paper': {
        borderRadius: 10,
        boxShadow: theme.customShadows[1],
      },
    }),
  },
};

export default Paper;
