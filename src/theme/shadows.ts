declare module '@mui/material/styles' {
  interface Theme {
    customShadows: string[];
  }
  interface ThemeOptions {
    customShadows?: string[];
  }
}

// [0] sm  — subtle lift (menus, dropdowns)
// [1] md  — card hover, focus rings
// [2] lg  — modals, drawers
// [3] green-glow — primary button hover
const customShadows = [
  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
  '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
  '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
  '0 4px 16px rgba(46,139,87,0.30)',
];

export default customShadows;
