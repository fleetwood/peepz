import { materializeTheme, resolveColorRef } from "./resolve";
import { warmTheme } from "./theme.warm";
import { peepsTheme } from "./theme.peeps";

export const themes = {
  warm     : warmTheme,
  peeps     : peepsTheme,
} as const;

type ThemeName = keyof typeof themes;

export const themeNames = Object.keys(themes) as ThemeName[];

export { materializeTheme, resolveColorRef };
