/** Vibes sample app — shared brand colors (defaults). */
export const defaultBrand = {
  navBackground: '#f6f8ff',
  primary: '#5169fd',
  tabActive: '#b21ed6',
  tabInactive: '#9a9a9a',
  body: '#676767',
  background: '#f6f8ff',
  surface: '#ffffff',
  white: '#ffffff',
} as const;

export type AppTheme = { [K in keyof typeof defaultBrand]: string };

/** Static default reference (e.g. migrations). */
export const brand: AppTheme = { ...defaultBrand };
