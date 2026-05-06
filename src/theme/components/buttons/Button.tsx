import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: () => ({
      borderRadius: 10,
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
      transition: 'all 0.18s ease',
      '&:active': {
        transform: 'scale(0.98)',
      },
    }),

    // ── Contained / Primary (green) ──────────────────────────────────────────
    containedPrimary: ({ theme }) => ({
      color: '#FFFFFF',
      backgroundColor: theme.palette.primary.main,  // #2E8B57
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,  // #1F6B40
        transform: 'translateY(-1px)',
        boxShadow: theme.customShadows[3],  // green glow
      },
      '&:active': {
        backgroundColor: theme.palette.primary.darker,
        transform: 'scale(0.98)',
        boxShadow: 'none',
      },
      '&.Mui-disabled': {
        backgroundColor: '#C3E6D3',
        color: '#7ECBA5',
      },
    }),

    // ── Contained / Secondary (white outlined-style) ─────────────────────────
    containedSecondary: ({ theme }) => ({
      color: theme.palette.text.primary,
      backgroundColor: '#FFFFFF',
      border: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        backgroundColor: theme.palette.info.dark,  // #E8F5EE
        borderColor: '#C3E6D3',
      },
    }),

    // ── Outlined ─────────────────────────────────────────────────────────────
    outlinedPrimary: ({ theme }) => ({
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.lighter,  // #E8F5EE
        borderColor: theme.palette.primary.dark,
      },
    }),

    // ── Text ─────────────────────────────────────────────────────────────────
    text: ({ theme }) => ({
      color: theme.palette.primary.main,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: theme.palette.primary.lighter,
      },
    }),

    // ── Sizes ─────────────────────────────────────────────────────────────────
    sizeLarge: {
      height: 48,
      padding: '0 24px',
      fontSize: '0.9375rem',
    },
    sizeMedium: {
      height: 40,
      padding: '0 18px',
      fontSize: '0.875rem',
    },
    sizeSmall: {
      height: 32,
      padding: '0 12px',
      fontSize: '0.8125rem',
    },

    startIcon: { marginRight: 6 },
    endIcon: { marginLeft: 6 },
  },
};

export default Button;
