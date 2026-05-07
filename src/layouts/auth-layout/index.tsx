import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Image from 'components/base/Image';

const LogoImg = '/assets/brand-logo.png';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Left branding panel — hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          bgcolor: 'primary.main',
          px: 6,
          py: 8,
          gap: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative circle top-right */}
        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            top: -100,
            right: -100,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }}
        />
        {/* decorative circle bottom-left */}
        <Box
          sx={{
            position: 'absolute',
            width: 240,
            height: 240,
            bottom: -80,
            left: -80,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <Stack alignItems="center" spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.12)',
              borderRadius: 4,
              px: 4,
              py: 3,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Image src={LogoImg} alt="Invictus logo" height={56} width={220} />
          </Box>

          <Typography
            variant="h4"
            fontWeight={800}
            color="white"
            align="center"
            sx={{ lineHeight: 1.25, mt: 1 }}
          >
            Welcome to Invictus
          </Typography>

          <Typography
            variant="body1"
            color="rgba(255,255,255,0.75)"
            align="center"
            sx={{ maxWidth: 320 }}
          >
            Your all-in-one platform for lead management, client tracking, and team performance analytics.
          </Typography>
        </Stack>
      </Box>

      {/* Right form panel */}
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          flex: { xs: 1, md: 'none' },
          width: { xs: '100%', md: 480 },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          px: { xs: 2, sm: 4 },
          py: 6,
        }}
      >
        {/* Logo visible only on mobile (left panel is hidden) */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Image src={LogoImg} alt="Invictus logo" height={44} width={180} />
        </Box>

        <Paper
          elevation={0}
          sx={{
            px: { xs: 3, sm: 4 },
            py: 3.5,
            width: '100%',
            maxWidth: 420,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(15,23,42,0.10)',
            border: '1px solid rgba(15,23,42,0.07)',
          }}
        >
          {children}
        </Paper>
      </Stack>
    </Box>
  );
};

export default AuthLayout;
