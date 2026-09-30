"use client";

import NextLink from "next/link";
import { createTheme } from "@mui/material/styles";

// Slate neutrals with an indigo accent. In light mode the darker shade of each status colour is
// used and in dark mode a lighter one, so text on tinted backgrounds meets WCAG AA contrast.
const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
};

const theme = createTheme({
  // Colours are CSS variables and the active scheme is a class on <html>, so switching between
  // light and dark needs no re-render and the server-rendered HTML is the same for both.
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4f46e5", light: "#818cf8", dark: "#4338ca", contrastText: "#ffffff" },
        success: { main: "#047857" },
        warning: { main: "#92400e" },
        error: { main: "#b91c1c" },
        info: { main: "#0369a1" },
        grey: slate,
        text: { primary: slate[900], secondary: slate[500] },
        divider: slate[200],
        background: { default: "#f5f7fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#818cf8", light: "#a5b4fc", dark: "#6366f1", contrastText: "#0b1120" },
        success: { main: "#34d399" },
        warning: { main: "#fbbf24" },
        error: { main: "#fca5a5" },
        info: { main: "#38bdf8" },
        grey: slate,
        text: { primary: slate[200], secondary: slate[400] },
        divider: "rgb(148 163 184 / 0.16)",
        background: { default: "#020617", paper: slate[900] },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: "0.08em" },
  },
  components: {
    // Thin scrollbars that follow the colour scheme (standard properties, plus the WebKit
    // pseudo-elements for Safari).
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: `${slate[300]} transparent`,
          ...theme.applyStyles("dark", { scrollbarColor: `${slate[700]} transparent` }),
        },
        "*::-webkit-scrollbar": { width: 8, height: 8 },
        "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: 8,
          backgroundColor: slate[300],
          ...theme.applyStyles("dark", { backgroundColor: slate[700] }),
        },
      }),
    },
    // Any MUI component rendered with an `href` navigates client-side through next/link.
    MuiButtonBase: { defaultProps: { LinkComponent: NextLink } },
    MuiLink: { defaultProps: { component: NextLink } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: "0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)",
          ...theme.applyStyles("dark", { boxShadow: "none" }),
        }),
      },
    },
    MuiCardHeader: {
      defaultProps: { slotProps: { title: { variant: "subtitle1" }, subheader: { variant: "body2" } } },
    },
    MuiTextField: {
      // Labels always sit above the field, so empty and filled fields look the same.
      defaultProps: { fullWidth: true, slotProps: { inputLabel: { shrink: true } } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({ backgroundColor: theme.vars.palette.background.paper }),
        notchedOutline: ({ theme }) => ({
          borderColor: slate[300],
          ...theme.applyStyles("dark", { borderColor: "rgb(148 163 184 / 0.3)" }),
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: slate[100],
          ...theme.applyStyles("dark", { borderColor: "rgb(148 163 184 / 0.12)" }),
        }),
        head: ({ theme }) => ({
          backgroundColor: slate[50],
          color: theme.vars.palette.text.secondary,
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          ...theme.applyStyles("dark", { backgroundColor: "rgb(148 163 184 / 0.06)" }),
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.MuiTableRow-hover:hover": { backgroundColor: theme.alpha(theme.vars.palette.primary.main, 0.06) },
        }),
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});

export default theme;
