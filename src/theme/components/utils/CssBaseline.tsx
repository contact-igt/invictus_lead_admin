import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import scrollbar from 'theme/styles/scrollbar';

const CssBaseline: Components<Omit<Theme, 'components'>>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    '*, *::before, *::after': {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
    html: {
      scrollBehavior: 'smooth',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    body: {
      fontFamily: '"DM Sans", sans-serif',
      backgroundColor: theme.palette.info.light, // #F4F6F5
      color: theme.palette.text.primary,
      lineHeight: 1.6,
      ...scrollbar(theme),
    },
    // Selection
    '::selection': {
      backgroundColor: '#C3E6D3',
      color: '#111714',
    },
    // Focus visible — brand green ring
    ':focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    // Global link style
    a: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    // Smooth transitions for interactive elements
    'button, a, input, select, textarea': {
      transition: 'all 0.18s ease',
    },
  }),
};

export default CssBaseline;
