import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Chip: Components<Omit<Theme, 'components'>>['MuiChip'] = {
  styleOverrides: {
    root: {
      margin: 0,
      fontWeight: 600,
      letterSpacing: '0.01em',
    },

    // ── Sizes ─────────────────────────────────────────────────────────────────
    sizeSmall: ({ theme }) => ({
      height: 22,
      borderRadius: 6,
      padding: theme.spacing(0, 1),
      fontSize: '0.6875rem',
    }),
    sizeMedium: ({ theme }) => ({
      height: 26,
      borderRadius: 6,
      padding: theme.spacing(0, 1.25),
      fontSize: '0.75rem',
    }),

    // ── Color variants ────────────────────────────────────────────────────────
    colorPrimary: ({ theme }) => ({
      color: theme.palette.primary.dark,       // #1F6B40
      backgroundColor: theme.palette.primary.lighter,  // #E8F5EE
    }),
    colorSuccess: ({ theme }) => ({
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.lighter,
    }),
    colorWarning: ({ theme }) => ({
      color: theme.palette.warning.dark,
      backgroundColor: theme.palette.warning.lighter,
    }),
    colorError: ({ theme }) => ({
      color: theme.palette.error.dark,
      backgroundColor: theme.palette.error.lighter,
    }),
    colorInfo: () => ({
      color: '#2D5DB8',
      backgroundColor: '#EEF3FF',
    }),

    iconSmall: { width: 12, margin: '0 !important' },
    iconMedium: { width: 14, margin: '0 !important' },
    labelSmall: { padding: '0 2px', textTransform: 'capitalize' },
    labelMedium: { padding: '0 2px', textTransform: 'capitalize' },
  },
};

export default Chip;
