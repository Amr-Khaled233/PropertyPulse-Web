// Design tokens (colors, spacing, typography) exposed to JS (charts, inline styles).
// Mirrors the CSS custom properties in styles/globals.css.

export const theme = {
  colors: {
    primary: '#2563eb',
    navy: '#0a1b2e',
    green: '#0e9b72',
    success: '#0e9b72',
    orange: '#d4550a',
    warning: '#d4550a',
    danger: '#c0392b',
    cream: '#f8f7f4',
    surface: '#ffffff',
    border: '#e6e3dc',
    text: '#14202e',
    textMuted: '#6b7785',
    chart: ['#0a1b2e', '#0e9b72', '#d4550a', '#2563eb', '#7c3aed', '#0891b2'],
  },
  radius: { sm: '8px', md: '12px', lg: '18px', pill: '999px' },
  spacing: (n: number) => `${n * 4}px`,
  font: {
    body: "'DM Sans', system-ui, sans-serif",
    head: "'Newsreader', Georgia, serif",
  },
} as const;

export type Theme = typeof theme;
