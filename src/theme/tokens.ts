// ── Invictus Design Tokens ───────────────────────────────────────────────────
// Single source of truth for the redesigned UI. Every surface, border, text
// colour and spacing step in the new component layer resolves to a token here
// so light and dark stay in lockstep and nothing drifts per-page.
//
// Consume via `useTokens()` (hooks/useTokens.ts) rather than importing the
// palettes directly — that hook picks the right set for the active colour mode.

export type ThemeMode = 'light' | 'dark';

// ── Spacing: strict 8px system ───────────────────────────────────────────────
// Half-steps (4px) exist only for icon/text gaps inside a control.
export const space = {
  half: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
} as const;

// ── Radii ────────────────────────────────────────────────────────────────────
export const radius = {
  control: 8, // inputs, buttons, chips
  card: 12, // cards, panels
  section: 16, // large surfaces, drawers
  pill: 999,
} as const;

// ── Type scale ───────────────────────────────────────────────────────────────
export const font = {
  sans: '"Geist", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
} as const;

// Chrome stays quiet; data is loud. The page title is navigation furniture, so
// it sits *below* the metrics in scale — the number is the thing being read.
export const type = {
  pageTitle: { size: '1.375rem', weight: 650, tracking: '-0.02em', leading: 1.25 }, // 22
  sectionTitle: { size: '1rem', weight: 600, tracking: '-0.01em', leading: 1.35 }, // 16
  cardTitle: { size: '0.9375rem', weight: 600, tracking: '-0.01em', leading: 1.4 }, // 15
  body: { size: '0.875rem', weight: 400, tracking: '0em', leading: 1.55 }, // 14
  label: { size: '0.8125rem', weight: 500, tracking: '0em', leading: 1.45 }, // 13
  caption: { size: '0.75rem', weight: 400, tracking: '0em', leading: 1.4 }, // 12
  eyebrow: { size: '0.6875rem', weight: 600, tracking: '0.07em', leading: 1.4 }, // 11 uppercase
  metric: { size: '1.875rem', weight: 680, tracking: '-0.035em', leading: 1.05 }, // 30, mono
  metricSm: { size: '1.375rem', weight: 680, tracking: '-0.03em', leading: 1.1 }, // 22, mono
} as const;

// Strict rhythm. Every surface in `components/ui` uses these three values and
// nothing else — the previous 6/12/16/20/24 spread was not a system.
export const density = {
  cardPadding: 16,
  gridGap: 12,
  bandGap: 20,
} as const;

// ── Motion ───────────────────────────────────────────────────────────────────
// Interaction feedback only. No decorative animation.
export const motion = {
  hover: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  panel: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ── Semantic status ──────────────────────────────────────────────────────────
// Deliberately separate from the brand accent: "needs attention" must never
// compete visually with "this is the primary action".
export interface StatusTone {
  fg: string;
  bg: string;
  border: string;
}

export interface Tokens {
  mode: ThemeMode;

  // Surfaces
  canvas: string; // page ground
  surface: string; // card fill
  surfaceRaised: string; // nested/hover card fill
  surfaceSunken: string; // wells, table headers, inputs

  // Lines
  border: string; // default hairline
  borderStrong: string; // emphasised divider, hover
  borderFocus: string;

  // Text
  ink: string; // primary
  inkSecondary: string; // supporting copy
  inkMuted: string; // metadata, placeholders
  inkInverse: string;

  // Brand
  accent: string; // solid fills, white text sits on this
  accentHover: string;
  accentText: string; // accent as text/icon on light ground
  accentSoft: string; // tint fill
  accentSoftBorder: string;
  mint: string; // secondary highlight

  // Status
  success: StatusTone;
  warning: StatusTone;
  danger: StatusTone;
  info: StatusTone;
  neutral: StatusTone;

  // Elevation — soft only, never a glow
  shadowCard: string;
  shadowHover: string;
  shadowOverlay: string;

  // Data visualisation series, in fixed order
  series: string[];
}

export const lightTokens: Tokens = {
  mode: 'light',

  canvas: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#F1F5F3',

  border: '#E4EAE7',
  borderStrong: '#D2DBD7',
  borderFocus: '#047857',

  ink: '#0C1512',
  inkSecondary: '#5A6B65',
  inkMuted: '#8A9A94',
  inkInverse: '#FFFFFF',

  accent: '#047857',
  accentHover: '#036348',
  accentText: '#047857',
  accentSoft: '#ECFDF5',
  accentSoftBorder: '#C7EFDD',
  mint: '#6EE7B7',

  success: { fg: '#047857', bg: '#ECFDF5', border: '#C7EFDD' },
  warning: { fg: '#B45309', bg: '#FFFBEB', border: '#FDE9C8' },
  danger: { fg: '#B91C1C', bg: '#FEF2F2', border: '#FBD5D5' },
  info: { fg: '#1D4ED8', bg: '#EFF6FF', border: '#D3E2FD' },
  neutral: { fg: '#5A6B65', bg: '#F1F5F3', border: '#E4EAE7' },

  shadowCard: '0 1px 2px rgba(12, 21, 18, 0.04), 0 1px 3px rgba(12, 21, 18, 0.03)',
  shadowHover: '0 4px 12px rgba(12, 21, 18, 0.07)',
  shadowOverlay: '0 12px 32px rgba(12, 21, 18, 0.12)',

  series: ['#047857', '#1D4ED8', '#B45309', '#0E7490', '#7C3AED', '#BE185D', '#4D7C0F', '#9A3412'],
};

export const darkTokens: Tokens = {
  mode: 'dark',

  canvas: '#0A0F0D',
  surface: '#111815',
  surfaceRaised: '#161F1B',
  surfaceSunken: '#0D1310',

  border: '#1E2A26',
  borderStrong: '#2A3A34',
  borderFocus: '#10B981',

  ink: '#E9F1ED',
  inkSecondary: '#9AAAA4',
  inkMuted: '#6B7C76',
  inkInverse: '#0A0F0D',

  accent: '#059669',
  accentHover: '#0AAD7A',
  accentText: '#34D399',
  accentSoft: '#052E1F',
  accentSoftBorder: '#0B4634',
  mint: '#6EE7B7',

  success: { fg: '#34D399', bg: '#052E1F', border: '#0B4634' },
  warning: { fg: '#FCD34D', bg: '#2E2206', border: '#4A3708' },
  danger: { fg: '#FCA5A5', bg: '#2E0F0F', border: '#4A1818' },
  info: { fg: '#93C5FD', bg: '#0B1D3A', border: '#152F5A' },
  neutral: { fg: '#9AAAA4', bg: '#161F1B', border: '#2A3A34' },

  shadowCard: '0 1px 2px rgba(0, 0, 0, 0.32), 0 1px 3px rgba(0, 0, 0, 0.24)',
  shadowHover: '0 4px 14px rgba(0, 0, 0, 0.42)',
  shadowOverlay: '0 12px 36px rgba(0, 0, 0, 0.56)',

  series: ['#34D399', '#60A5FA', '#FBBF24', '#22D3EE', '#A78BFA', '#F472B6', '#A3E635', '#FB923C'],
};

export const tokensFor = (mode: ThemeMode): Tokens =>
  mode === 'dark' ? darkTokens : lightTokens;
