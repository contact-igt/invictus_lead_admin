import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

const Splash = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += current < 40 ? 2.5 : current < 70 ? 1.5 : current < 85 ? 0.8 : 0.2;
      if (current >= 90) { current = 90; clearInterval(timer); }
      setProgress(Math.round(current));
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: 'background.default',
        '@keyframes igt-fade-in': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes igt-logo-pulse': {
          '0%, 100%': { opacity: 0.8, transform: 'scale(0.97)' },
          '50%':       { opacity: 1,   transform: 'scale(1.03)' },
        },
      }}
    >
      <Stack
        direction="column"
        alignItems="center"
        spacing={0}
        sx={{ animation: 'igt-fade-in 0.45s ease-out' }}
      >

        {/* Brand logo — scale from natural size, no contain whitespace */}
        <Box
          component="img"
          src="/assets/brand-logo.png"
          alt="Invictus Global Tech"
          sx={{
            width: 200,
            height: 'auto',
            display: 'block',
            transform: 'scale(1.8)',
            transformOrigin: 'center center',
            mb: 3,
            animation: 'igt-logo-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Progress bar + percentage */}
        <Box sx={{ width: 240 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: 'text.secondary', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 500 }}
            >
              LOADING
            </Typography>
            <Typography
              sx={{ fontSize: '0.78rem', color: 'primary.main', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}
            >
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                transition: 'transform 0.08s linear',
              },
            }}
          />
        </Box>

      </Stack>
    </Stack>
  );
};

export default Splash;
      <Stack
        direction="column"
        alignItems="center"
        spacing={3}
        sx={{ animation: 'igt-fade-in 0.5s ease-out' }}
      >

        {/* Logo */}
        <Box
          component="img"
          src="/assets/brand-logo.png"
          alt="Invictus Global Tech"
          sx={{ width: 120, height: 120, objectFit: 'contain' }}
        />

        {/* Brand name */}
        <Stack direction="column" alignItems="center" spacing={0.5}>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '0.15em',
              color: 'text.primary',
              userSelect: 'none',
            }}
          >
            INVICTUS
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 500,
              fontSize: '0.65rem',
              letterSpacing: '0.28em',
              color: 'text.secondary',
              userSelect: 'none',
            }}
          >
            GLOBAL TECH
          </Typography>
        </Stack>

        {/* Ring spinner */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid',
            borderColor: 'divider',
            borderTopColor: 'primary.main',
            animation: 'igt-spin 0.75s linear infinite',
          }}
        />

      </Stack>
    </Stack>
  );
};

export default Splash;
