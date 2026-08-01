declare module '@mui/material/styles' {
  interface Theme {
    customShadows: string[];
  }
  interface ThemeOptions {
    customShadows?: string[];
  }
}

// Enterprise Shadow Tokens — Single subtle shadow only: 0 6px 20px rgba(15,23,42,.05)
// NO glows, NO colored shadows!
const customShadows = [
  '0 6px 20px rgba(15, 23, 42, 0.05)',  // [0] standard card/surface shadow
  '0 6px 20px rgba(15, 23, 42, 0.08)',  // [1] hover shadow
  '0 12px 32px rgba(15, 23, 42, 0.10)', // [2] modal/drawer shadow
  'none',                              // [3] no glow
];

export default customShadows;
