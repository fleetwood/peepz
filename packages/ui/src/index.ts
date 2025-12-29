import { materializeTheme, resolveColorRef } from "./resolve";
import { darkTheme } from "./theme.dark";
import { lightTheme } from "./theme.light";

export const themes = {
  dark : darkTheme,
  light: lightTheme,
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = (typeof themes)[ThemeName];

export const themeNames = Object.keys(themes) as ThemeName[];

export const THEME_MODE_LIGHT = "light" as const;
export const THEME_MODE_DARK  = "dark" as const;

export const themeModeByName = {
  dark : THEME_MODE_DARK,
  light: THEME_MODE_LIGHT,
} as const satisfies Record<ThemeName, typeof THEME_MODE_LIGHT | typeof THEME_MODE_DARK>;

export type ThemeMode = (typeof themeModeByName)[ThemeName];

export type ThemeColors     = Theme["colors"];
export type ThemeRadii      = Theme["radii"];
export type ThemeSpacing    = Theme["spacing"];
export type ThemeTypography = Theme["typography"];

export { materializeTheme, resolveColorRef };
