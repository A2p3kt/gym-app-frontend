/**
 * @fileoverview Material UI app theme and the brand constants shared with the AG Grid theme (see gridSetup.ts).
 */

import { createTheme } from '@mui/material';

/** Brand colors shared by MUI and AG Grid so tables match the rest of the UI. */
export const BRAND = {
  navy: '#1a365d',
  navyLight: '#2a4365',
  navyDark: '#0f2942',
  teal: '#00a3c4',
  tealLight: '#319795',
  tealDark: '#007791',
  border: '#e2e8f0',
  background: '#f7fafc',
} as const;

/** System font stack used across the app (no web-font download needed). */
export const FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

/**
 * Material UI theme: navy primary, teal secondary, rounded corners, no ALL-CAPS buttons.
 */
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.navy,
      light: BRAND.navyLight,
      dark: BRAND.navyDark,
    },
    secondary: {
      main: BRAND.teal,
      light: BRAND.tealLight,
      dark: BRAND.tealDark,
    },
    background: {
      default: BRAND.background,
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: FONT_FAMILY,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
