import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: () => ({
      borderRadius: 12, // 12px Button Spec
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Geist", sans-serif',
      letterSpacing: '0.01em',
      transition: 'all 0.15s ease',
      boxShadow: 'none !important',
      '&:active': {
        transform: 'scale(0.98)',
      },
    }),

    // ── Primary (solid green #16A34A, white text, NO glow) ───────────────────
    containedPrimary: () => ({
      color: '#FFFFFF',
      backgroundColor: '#16A34A',
      '&:hover': {
        backgroundColor: '#15803D',
        boxShadow: 'none !important',
      },
      '&:active': {
        backgroundColor: '#166534',
        boxShadow: 'none !important',
      },
      '&.Mui-disabled': {
        backgroundColor: '#DCFCE7',
        color: '#86EFAC',
      },
    }),

    // ── Secondary (white fill, #E5E7EB border, Slate-900 text) ───────────────
    containedSecondary: () => ({
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      boxShadow: 'none !important',
      '&:hover': {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
      },
    }),

    // ── Outlined ─────────────────────────────────────────────────────────────
    outlinedPrimary: () => ({
      color: '#16A34A',
      borderColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
      },
    }),

    // ── Text / Ghost ─────────────────────────────────────────────────────────
    text: () => ({
      color: '#0F172A',
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: '#F1F5F9',
      },
    }),

    // ── Sizes — 48px Default Large ───────────────────────────────────────────
    sizeLarge: {
      height: 48, // 48px Height Spec
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
