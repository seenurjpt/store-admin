type PaletteColor = "primary" | "success" | "warning" | "error" | "info";

/**
 * A soft, translucent version of a palette colour, e.g. for badge backgrounds.
 * It uses MUI's CSS variables, so it follows the active light/dark scheme, and it is a plain
 * string, so it can be used in `sx` from Server Components (which can't pass functions).
 */
export function tint(color: PaletteColor, opacity = 0.12) {
  return `rgba(var(--mui-palette-${color}-mainChannel) / ${opacity})`;
}

/** Selector for dark-mode overrides in `sx`, matching MUI's `theme.applyStyles("dark")`. */
export const DARK = "*:where(.dark) &";
