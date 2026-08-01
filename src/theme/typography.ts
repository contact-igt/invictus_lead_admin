import { TypographyOptions } from '@mui/material/styles/createTypography';

// Enterprise Typography Stack: Geist (Sans) + Geist Mono (Metrics & Metadata)
const geist = '"Geist", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const geistMono = '"Geist Mono", "JetBrains Mono", ui-monospace, monospace';

const typography: TypographyOptions = {
  fontFamily: geist,

  // Display: 38px / 700 / -0.03em
  h1: { fontFamily: geist, fontSize: '2.375rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
  // Page Heading: 32px / 700 / -0.025em
  h2: { fontFamily: geist, fontSize: '2rem',     fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
  // Section Heading: 22px / 600 / -0.02em
  h3: { fontFamily: geist, fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3 },
  // Card Heading: 15px / 600 / -0.01em
  h4: { fontFamily: geist, fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
  h5: { fontFamily: geist, fontSize: '0.875rem',  fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.45 },
  h6: { fontFamily: geist, fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0em', lineHeight: 1.5 },

  // Subtitle / Secondary
  subtitle1: { fontFamily: geist, fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontFamily: geist, fontSize: '0.8125rem', fontWeight: 400, color: '#64748B', lineHeight: 1.5 },

  // Body: 14px / 500
  body1: { fontFamily: geist, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
  // Secondary: 13px / 400
  body2: { fontFamily: geist, fontSize: '0.8125rem', fontWeight: 400, color: '#64748B', lineHeight: 1.5 },

  // Caption: 12px / 400
  caption: { fontFamily: geistMono, fontSize: '0.75rem', fontWeight: 400, color: '#64748B', lineHeight: 1.5 },
  overline: { fontFamily: geist, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.5 },

  button: { fontFamily: geist, fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.01em' },
};

export default typography;
