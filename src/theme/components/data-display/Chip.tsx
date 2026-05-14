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

    // ── Color variants — light + dark mode aware ───────────────────────────────
    colorPrimary: ({ theme }) => (
      theme.palette.mode === 'dark'
        ? {
            color: '#A8D8B9',
            backgroundColor: 'rgba(46,139,87,0.20)',
            '&:hover': { backgroundColor: 'rgba(46,139,87,0.30)' },
          }
        : {
            color: theme.palette.primary.dark,
            backgroundColor: theme.palette.primary.lighter,
            '&:hover': { backgroundColor: '#D4EDDF' },
          }
    ),

    colorSuccess: ({ theme }) => (
      theme.palette.mode === 'dark'
        ? {
            color: '#7ECBA5',
            backgroundColor: 'rgba(46,139,87,0.18)',
            '&:hover': { backgroundColor: 'rgba(46,139,87,0.28)' },
          }
        : {
            color: theme.palette.success.dark,
            backgroundColor: theme.palette.success.lighter,
            '&:hover': { backgroundColor: '#D4EDDF' },
          }
    ),

    colorWarning: ({ theme }) => (
      theme.palette.mode === 'dark'
        ? {
            color: '#FFCF6B',
            backgroundColor: 'rgba(245,158,58,0.20)',
            '&:hover': { backgroundColor: 'rgba(245,158,58,0.30)' },
          }
        : {
            color: theme.palette.warning.dark,
            backgroundColor: theme.palette.warning.lighter,
            '&:hover': { backgroundColor: '#FFEEC0' },
          }
    ),

    colorError: ({ theme }) => (
      theme.palette.mode === 'dark'
        ? {
            color: '#FFA8A8',
            backgroundColor: 'rgba(224,68,68,0.20)',
            '&:hover': { backgroundColor: 'rgba(224,68,68,0.30)' },
          }
        : {
            color: theme.palette.error.dark,
            backgroundColor: theme.palette.error.lighter,
            '&:hover': { backgroundColor: '#FFD6D6' },
          }
    ),

    colorInfo: ({ theme }) => (
      theme.palette.mode === 'dark'
        ? {
            color: '#93B5F0',
            backgroundColor: 'rgba(45,93,184,0.22)',
            '&:hover': { backgroundColor: 'rgba(45,93,184,0.32)' },
          }
        : {
            color: '#2D5DB8',
            backgroundColor: '#EEF3FF',
            '&:hover': { backgroundColor: '#D9E4FF' },
          }
    ),

    iconSmall: { width: 12, margin: '0 !important' },
    iconMedium: { width: 14, margin: '0 !important' },
    labelSmall: { padding: '0 2px', textTransform: 'capitalize' },
    labelMedium: { padding: '0 2px', textTransform: 'capitalize' },
  },
};

export default Chip;
