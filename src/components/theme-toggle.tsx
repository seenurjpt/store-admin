"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

/**
 * The saved mode is only known in the browser, so `mode` is undefined during server rendering
 * and the first client render. The page colours are already correct at that point (see
 * InitColorSchemeScript); only this toggle's icon and label update after hydration.
 */
export function useColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";

  return {
    isDark,
    label: isDark ? "Switch to light mode" : "Switch to dark mode",
    icon: isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />,
    toggle: () => setMode(isDark ? "light" : "dark"),
  };
}

export function ThemeToggle() {
  const { label, icon, toggle } = useColorModeToggle();

  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={toggle}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}
