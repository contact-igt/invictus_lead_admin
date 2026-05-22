import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

const PageLoader = () => {
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
        '@keyframes igt-logo-pulse': {
          '0%, 100%': { opacity: 0.8, transform: 'scale(0.97)' },
          '50%':       { opacity: 1,   transform: 'scale(1.03)' },
        },
      }}
    >
      <Stack direction="column" alignItems="center" spacing={1.5}>

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

export default PageLoader;
