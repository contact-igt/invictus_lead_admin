import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const IconButton: Components<Omit<Theme, 'components'>>['MuiIconButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      border: 1,
      borderStyle: 'solid',
      borderColor: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.10)'
        : theme.palette.info.main,
      backgroundColor: theme.palette.mode === 'dark'
        ? '#1A2420'
        : theme.palette.info.lighter,
      color: theme.palette.mode === 'dark'
        ? '#8A9C8D'
        : theme.palette.text.disabled,
      marginLeft: 0,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? '#243028'
          : theme.palette.info.dark,
      },
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5),
      fontSize: theme.typography.h4.fontSize,
    }),
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(1.175),
      fontSize: theme.typography.h5.fontSize,
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(0.875),
      fontSize: theme.typography.button.fontSize,
    }),
  },
};

export default IconButton;
