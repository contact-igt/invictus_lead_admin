import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';

const LogoImg = '/assets/brand-logo.png';

// ── Design Tokens ────────────────────────────────────────────────────────────
const BG_LEFT      = '#070A14';   // 45% left panel background
const BG_RIGHT     = '#090D1A';   // 55% right panel background
const GREEN_ACCENT = '#1A8F68';   // Exact green theme color (#1a8f68)
const TEXT_LIGHT   = 'rgba(240,246,252,0.95)';
const TEXT_MUTED   = 'rgba(240,246,252,0.50)';

// ── Feature pills (Lead Admin panel suitable) ────────────────────────────────
const PILLS = [
  { icon: 'hugeicons:user-multiple',      label: 'Leads & Enquiries', isGreen: false },
  { icon: 'hugeicons:chart-bar-line-01',  label: 'Team Analytics',    isGreen: false },
  { icon: 'hugeicons:megaphone-02',       label: 'Campaign Tracker',  isGreen: true  },
  { icon: 'hugeicons:globe-02',           label: 'Client Portals',    isGreen: false },
  { icon: 'hugeicons:activity-02',        label: 'Live Pipeline',     isGreen: false },
];

// ── Sub-component: Feature Pill ──────────────────────────────────────────────
const FeaturePill = ({ icon, label, isGreen }: { icon: string; label: string; isGreen?: boolean }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      px: 1.8,
      py: 0.9,
      borderRadius: '24px',
      bgcolor: '#111625',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      cursor: 'default',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'rgba(26,143,104,0.4)',
        bgcolor: '#161D30',
      },
    }}
  >
    <Icon icon={icon} width={15} height={15} color={isGreen ? GREEN_ACCENT : 'rgba(240,246,252,0.7)'} />
    <Typography
      sx={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'rgba(240,246,252,0.85)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Main Layout ──────────────────────────────────────────────────────────────
const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        bgcolor: BG_LEFT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL — 43% Width Branding + Hero
      ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: { md: '0 0 43%' },
          width: { md: '43%' },
          maxWidth: { md: '43%' },
          px: { md: 5, lg: 7 },
          py: 6,
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          bgcolor: BG_LEFT,
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Radial green glow background */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(26,143,104,0.15) 0%, rgba(26,143,104,0.02) 45%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Top Left Brand Logo Image */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={LogoImg}
            alt="Invictus OS"
            sx={{
              height: 48,
              width: 'auto',
              maxHeight: 52,
              objectFit: 'contain',
              filter: 'invert(1) hue-rotate(180deg)',
            }}
          />
        </Box>

        {/* Hero Content */}
        <Box sx={{ my: 'auto', py: 4 }}>
          {/* Green Eyebrow Tag */}
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: GREEN_ACCENT,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              mb: 2.5,
            }}
          >
            WELCOME | LEAD MANAGEMENT
          </Typography>

          {/* Large Headline */}
          <Typography
            sx={{
              fontSize: { md: '2.5rem', lg: '3.2rem' },
              fontWeight: 800,
              lineHeight: 1.12,
              color: TEXT_LIGHT,
              letterSpacing: '-0.02em',
            }}
          >
            Build robust,
          </Typography>
          <Typography
            sx={{
              fontSize: { md: '2.5rem', lg: '3.2rem' },
              fontWeight: 800,
              lineHeight: 1.12,
              color: GREEN_ACCENT,
              letterSpacing: '-0.02em',
              mb: 3,
            }}
          >
            scale limitlessly.
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: '0.92rem',
              color: TEXT_MUTED,
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 420,
            }}
          >
            Your central workspace for lead management, client portals, and team performance analytics.
          </Typography>

          {/* Feature Pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, maxWidth: 440 }}>
            {PILLS.map((pill) => (
              <FeaturePill key={pill.label} icon={pill.icon} label={pill.label} isGreen={pill.isGreen} />
            ))}
          </Box>
        </Box>

        {/* Footer Copyright */}
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: 'rgba(240,246,252,0.35)',
            letterSpacing: '0.01em',
          }}
        >
          © 2026 Invictus Global Tech Pvt. Ltd. · Chennai, India
        </Typography>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — 57% Width Form Area
      ══════════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: { xs: '1 1 100%', md: '0 0 57%' },
          width: { xs: '100%', md: '57%' },
          maxWidth: { xs: '100%', md: '57%' },
          minHeight: '100vh',
          bgcolor: BG_RIGHT,
          px: { xs: 3, sm: 6, lg: 10 },
          py: { xs: 8, md: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Mobile Logo */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'absolute',
            top: 28,
            left: 0,
            right: 0,
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={LogoImg}
            alt="Invictus OS"
            sx={{
              height: 38,
              width: 'auto',
              objectFit: 'contain',
              filter: 'invert(1) hue-rotate(180deg)',
            }}
          />
        </Box>

        {/* Form Container */}
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;




