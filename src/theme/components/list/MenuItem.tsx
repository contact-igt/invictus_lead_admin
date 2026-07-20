import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const MenuItem: Components<Omit<Theme, 'components'>>['MuiMenuItem'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontWeight: 500,
      padding: theme.spacing(0.75, 1.25),
      fontSize: theme.typography.body2.fontSize,
      borderRadius: theme.shape.borderRadius * 1.5,
      color: theme.palette.text.primary,
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&, & *': {
        color: 'inherit',
        WebkitTextFillColor: 'currentColor',
      },
      '& .MuiTypography-root, & .MuiListItemIcon-root, & .iconify, & em': {
        color: 'inherit',
        WebkitTextFillColor: 'currentColor',
      },
      '&:hover, &.Mui-focusVisible': {
        backgroundColor: theme.palette.primary.lighter,
        color: theme.palette.primary.darker,
      },
      '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
        backgroundColor: theme.palette.primary.lighter,
        color: theme.palette.primary.darker,
        fontWeight: 600,
      },
      '&.Mui-selected:hover': {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.darker,
      },
      '&.Mui-disabled': {
        color: theme.palette.text.disabled,
        WebkitTextFillColor: theme.palette.text.disabled,
      },
    }),
  },
};

export default MenuItem;
