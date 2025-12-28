import { darkTheme } from "./theme.dark";
import { lightTheme } from "./theme.light";
import { materializeTheme, resolveColorRef } from "./resolve";

export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = (typeof themes)[ThemeName];

export type ThemeColors = Theme["colors"];
export type ThemeRadii = Theme["radii"];
export type ThemeSpacing = Theme["spacing"];
export type ThemeTypography = Theme["typography"];

export { materializeTheme, resolveColorRef };
