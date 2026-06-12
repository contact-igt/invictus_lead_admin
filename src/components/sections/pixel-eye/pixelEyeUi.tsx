import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import useColorMode from 'hooks/useColorMode';

export const PIXELEYE_COLORS = {
  backgroundDark: '#08110D',
  backgroundDarker: '#050807',
  card: '#0B1511',
  cardRaised: '#111F19',
  border: 'rgba(80, 120, 100, 0.25)',
  borderStrong: 'rgba(134, 239, 172, 0.18)',
  primary: '#156A45',
  primaryStrong: '#1F6B40',
  primaryHover: '#1C7A4C',
  primaryText: '#DFFFE3',
  mutedText: '#94A3B8',
  mutedTextStrong: '#B7C7BD',
  danger: '#DC2626',
  dangerBorder: 'rgba(248, 113, 113, 0.22)',
} as const;

type PixelEyeMode = 'dark' | 'light';

const getModeStyles = (mode: PixelEyeMode) => ({
  pageBackground:
    mode === 'dark'
      ? `linear-gradient(180deg, ${PIXELEYE_COLORS.backgroundDark} 0%, #0B1410 42%, ${PIXELEYE_COLORS.backgroundDarker} 100%)`
      : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
  pageText: mode === 'dark' ? '#EAF7EE' : '#0F172A',
  cardBackground: mode === 'dark' ? PIXELEYE_COLORS.card : '#ffffff',
  cardRaised: mode === 'dark' ? PIXELEYE_COLORS.cardRaised : '#ffffff',
  cardBorder: mode === 'dark' ? PIXELEYE_COLORS.border : 'rgba(226, 232, 240, 0.9)',
  subtleCardBackground: mode === 'dark' ? '#0F1B16' : '#F8FAFC',
  subtleBorder: mode === 'dark' ? 'rgba(80, 120, 100, 0.18)' : 'rgba(226, 232, 240, 0.9)',
  textPrimary: mode === 'dark' ? '#FFFFFF' : '#0F172A',
  textSecondary: mode === 'dark' ? PIXELEYE_COLORS.mutedText : '#64748B',
  textMuted: mode === 'dark' ? PIXELEYE_COLORS.mutedTextStrong : '#94A3B8',
  fieldBackground: mode === 'dark' ? '#111F19' : '#F8FAFC',
  fieldHover: mode === 'dark' ? '#14261F' : '#F1F5F9',
  fieldFocus: mode === 'dark' ? '#14261F' : '#FFFFFF',
});

export const getPixelEyeFieldSx = (mode: PixelEyeMode): SxProps<Theme> => ({
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    height: 46,
    '&.MuiInputBase-multiline': {
      height: 'auto',
    },
    backgroundColor: getModeStyles(mode).fieldBackground,
    color: getModeStyles(mode).textPrimary,
    borderRadius: '14px',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: getModeStyles(mode).fieldHover,
    },
    '&.Mui-focused': {
      backgroundColor: getModeStyles(mode).fieldFocus,
      boxShadow:
        mode === 'dark' ? '0 0 0 4px rgba(34, 197, 94, 0.2)' : '0 0 0 4px rgba(31, 107, 64, 0.15)',
    },
    '& fieldset': {
      borderColor: mode === 'dark' ? 'rgba(176, 205, 185, 0.18)' : 'rgba(226, 232, 240, 0.9)',
    },
    '&:hover fieldset': {
      borderColor: mode === 'dark' ? 'rgba(134, 239, 172, 0.35)' : PIXELEYE_COLORS.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: mode === 'dark' ? '#86EFAC' : PIXELEYE_COLORS.primary,
      borderWidth: '1px !important',
    },
    '& .MuiInputBase-input': {
      padding: '12px 14px',
      minHeight: 20,
      outline: 'none',
      boxShadow: 'none',
    },
    '& .MuiInputBase-input:focus': {
      outline: 'none',
      boxShadow: 'none',
    },
    '& .MuiInputBase-input:focus-visible': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: getModeStyles(mode).textSecondary,
    fontWeight: 600,
    fontSize: '0.85rem',
    '&.Mui-focused': {
      color: mode === 'dark' ? '#86EFAC' : PIXELEYE_COLORS.primary,
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -11px) scale(0.75)',
      fontWeight: 800,
      color: mode === 'dark' ? '#86EFAC' : PIXELEYE_COLORS.primary,
      backgroundColor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
      padding: '0 6px',
      marginLeft: '0px',
      borderRadius: '4px',
    },
  },
  '& .MuiSelect-icon, & .MuiSvgIcon-root': {
    color: getModeStyles(mode).textMuted,
  },
  '& .MuiFormHelperText-root': {
    color: mode === 'dark' ? PIXELEYE_COLORS.mutedText : '#64748B',
    marginLeft: 0,
  },
});

export const getPixelEyeMenuProps = (mode: PixelEyeMode) => ({
  MenuProps: {
    PaperProps: {
      sx: {
        maxHeight: 320,
        backgroundColor: getModeStyles(mode).cardBackground,
        color: getModeStyles(mode).textPrimary,
        border: `1px solid ${mode === 'dark' ? 'rgba(176, 205, 185, 0.16)' : '#E2E8F0'}`,
        borderRadius: 3,
        boxShadow:
          mode === 'dark' ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(15,23,42,0.08)',
        '& .MuiMenuItem-root': {
          fontSize: '0.875rem',
          py: 1.2,
          px: 2,
          '&:hover': {
            backgroundColor:
              mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(31, 107, 64, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor:
              mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(31, 107, 64, 0.08)',
            fontWeight: 700,
            '&:hover': {
              backgroundColor:
                mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(31, 107, 64, 0.12)',
            },
          },
        },
      },
    },
  },
});

export const getPixelEyeCardSx = (mode: PixelEyeMode): SxProps<Theme> => ({
  borderRadius: '22px',
  border: '1px solid',
  borderColor: getModeStyles(mode).cardBorder,
  background: getModeStyles(mode).cardBackground,
  boxShadow: mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.24)' : '0 15px 35px rgba(15,23,42,0.05)',
});

export const getPixelEyeRaisedCardSx = (mode: PixelEyeMode): SxProps<Theme> => ({
  borderRadius: '22px',
  border: '1px solid',
  borderColor: getModeStyles(mode).cardBorder,
  background: getModeStyles(mode).cardRaised,
  boxShadow: mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.24)' : '0 15px 35px rgba(15,23,42,0.05)',
});

export const getPixelEyeButtonSx = (
  mode: PixelEyeMode,
  variant: 'primary' | 'secondary' | 'danger' = 'secondary',
) => {
  const base = {
    borderRadius: '14px',
    textTransform: 'none',
    fontWeight: 700,
    px: 2.25,
    py: 1.1,
    minHeight: 42,
  } as const;

  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: PIXELEYE_COLORS.primaryStrong,
      color: '#FFFFFF',
      '&:hover': { backgroundColor: PIXELEYE_COLORS.primaryHover },
    };
  }

  if (variant === 'danger') {
    return {
      ...base,
      borderColor: mode === 'dark' ? '#7F1D1D' : '#FCA5A5',
      color: mode === 'dark' ? '#FCA5A5' : '#B91C1C',
      '&:hover': {
        borderColor: '#DC2626',
        backgroundColor: mode === 'dark' ? 'rgba(220,38,38,0.08)' : '#FEF2F2',
      },
    };
  }

  return {
    ...base,
    borderColor: mode === 'dark' ? 'rgba(134, 239, 172, 0.2)' : 'rgba(226, 232, 240, 0.95)',
    color: mode === 'dark' ? PIXELEYE_COLORS.primaryText : PIXELEYE_COLORS.primary,
    backgroundColor: mode === 'dark' ? '#102118' : '#FFFFFF',
    '&:hover': {
      borderColor: PIXELEYE_COLORS.primary,
      backgroundColor: mode === 'dark' ? '#14261D' : '#F8FAFC',
    },
  };
};

export const PixelEyePageShell = ({ children }: { children: ReactNode }) => {
  const { mode } = useColorMode();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        px: { xs: 2, md: 3, lg: 4 },
        py: { xs: 3, md: 4, lg: 5 },
        color: getModeStyles(mode).pageText,
        background: getModeStyles(mode).pageBackground,
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ width: '100%', mx: 'auto' }}>{children}</Box>
    </Box>
  );
};

export const PixelEyePageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => {
  const { mode } = useColorMode();
  const styles = getModeStyles(mode);

  return (
    <PixelEyeCard
      sx={{ p: { xs: 3, md: 4, lg: 5 }, mb: 4, position: 'relative', overflow: 'visible' }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 0.5,
              borderRadius: '100px',
              backgroundColor:
                mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(21, 106, 69, 0.05)',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: mode === 'dark' ? '#4ade80' : '#156A45',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: '0.18em',
                color: mode === 'dark' ? '#4ade80' : '#156A45',
                fontWeight: 800,
                fontSize: '0.7rem',
                lineHeight: 1,
              }}
            >
              {eyebrow}
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              lineHeight: 1.1,
              color: styles.textPrimary,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                maxWidth: 800,
                color: styles.textSecondary,
                fontSize: '0.95rem',
                lineHeight: 1.6,
                opacity: 0.85,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions ? (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: { xs: 2, md: 0 } }}>
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </PixelEyeCard>
  );
};

export const PixelEyeCard = ({
  children,
  raised = false,
  sx,
}: {
  children: ReactNode;
  raised?: boolean;
  sx?: SxProps<Theme>;
}) => {
  const { mode } = useColorMode();
  return (
    <Paper
      elevation={0}
      sx={[
        raised ? getPixelEyeRaisedCardSx(mode) : getPixelEyeCardSx(mode),
        ...(Array.isArray(sx) ? sx : [sx]).filter(Boolean),
      ]}
    >
      {children}
    </Paper>
  );
};
