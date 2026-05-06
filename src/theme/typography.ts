import { TypographyOptions } from '@mui/material/styles/createTypography';

const spaceGrotesk = '"Space Grotesk", sans-serif';
const dmSans = '"DM Sans", sans-serif';

const typography: TypographyOptions = {
  // Body / default font
  fontFamily: dmSans,

  h1: { fontFamily: spaceGrotesk, fontSize: '2.5rem',  fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  h2: { fontFamily: spaceGrotesk, fontSize: '2rem',    fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
  h3: { fontFamily: spaceGrotesk, fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h4: { fontFamily: spaceGrotesk, fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
  h5: { fontFamily: spaceGrotesk, fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontFamily: spaceGrotesk, fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.45 },

  subtitle1: { fontFamily: dmSans, fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontFamily: dmSans, fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5 },

  body1: { fontFamily: dmSans, fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.6 },
  body2: { fontFamily: dmSans, fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.6 },

  caption: { fontFamily: dmSans, fontSize: '0.75rem',  fontWeight: 500, lineHeight: 1.5 },
  overline: { fontFamily: dmSans, fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.6 },

  button: { fontFamily: dmSans, fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.01em' },
};

export default typography;
