import { PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { green, dark, surface, text, status, border, red, yellow } from './colors';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    neutral?: PaletteColorOptions;
    transparent?: {
      gray: PaletteColorOptions;
    };
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
    state?: string;
  }
  interface Palette {
    neutral: PaletteColor;
    transparent: {
      gray: PaletteColor;
    };
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
    state: string;
  }
}

const palette: PaletteOptions = {
  // ── Primary: Invictus Green ────────────────────────────────────────────────
  primary: {
    lighter: green.tint,      // #EAF8F3 — chip bg, hover tints
    light: green.light,     // #52C79F — icon fills, highlights
    main: green.primary,   // #29AF81 — buttons, active states ← BRAND
    dark: green.dark,      // #218D68 — button hover, sidebar active
    darker: green.deeper,    // #196B4F — pressed states
    state: green.mid,       // #29AF81 — badge accents, left borders
  },

  // ── Secondary: used for outlined/secondary UI elements ───────────────────
  secondary: {
    lighter: green.pale,      // #C4EFE1
    light: green.mid,       // #29AF81
    main: green.dark,      // #218D68
    dark: dark.base,       // #0F172A
    darker: '#000000',
  },

  // ── Info: surface / background system (used by existing component overrides)
  // info.lighter → Paper/card bg (white)
  // info.light   → page body background
  // info.main    → row border color (DataGrid), dividers
  // info.dark    → subtle tint bg (hover, chips)
  // info.darker  → border color
  info: {
    lighter: surface.card,    // #FFFFFF — Paper, button text color
    light: surface.page,    // #F8FAFC — body background
    main: border.default,  // #E5E7EB — DataGrid row borders
    dark: green.tint,      // #EAF8F3 — hover backgrounds
    darker: green.pale,      // #C4EFE1 — border accents
  },

  // ── Success ────────────────────────────────────────────────────────────────
  success: {
    lighter: status.successBg,  // #EAF8F3
    light: green.light,       // #52C79F
    main: green.primary,     // #29AF81
    dark: green.dark,        // #218D68
    darker: green.deeper,      // #196B4F
  },

  // ── Warning ────────────────────────────────────────────────────────────────
  warning: {
    lighter: status.warningBg,  // #FFF8E8
    light: yellow[300],       // #FFCF6B
    main: yellow[500],       // #F59E3A
    dark: yellow[600],       // #C47A15
    darker: yellow[700],       // #9A5D0E
  },

  // ── Error / Danger ─────────────────────────────────────────────────────────
  error: {
    lighter: status.dangerBg,   // #FFF0F0
    light: red[300],          // #FFA8A8
    main: red[500],          // #E04444
    dark: red[600],          // #C43535
    darker: red[700],          // #A82929
  },

  // ── Neutral ────────────────────────────────────────────────────────────────
  neutral: {
    lighter: surface.page,    // #F4F6F5
    light: border.default,  // #E8EDE9
    main: '#8A9C8D',       // muted text
    dark: text.secondary,  // #4A5C4D
    darker: text.primary,    // #111714
  },

  // ── Text ───────────────────────────────────────────────────────────────────
  text: {
    primary: text.primary,    // #111714
    secondary: text.secondary,  // #4A5C4D
    disabled: '#8A9C8D',
  },

  // ── Background ─────────────────────────────────────────────────────────────
  background: {
    default: surface.page,   // #F4F6F5
    paper: surface.card,   // #FFFFFF
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: border.default,   // #E8EDE9

  // ── Misc ───────────────────────────────────────────────────────────────────
  transparent: {
    gray: {
      main: 'rgba(17,23,20,0.06)',
    },
  },
};

export default palette;
