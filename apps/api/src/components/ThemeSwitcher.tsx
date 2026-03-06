"use client";

import { useLayout } from "@/context/LayoutProvider";
import { WithClassName } from "@peeps/types";
import { themeNames, themes } from "@peeps/ui";
import { cn } from "@peeps/utils/classnames";
import {
  Computer,
  Egg,
  FileQuestion,
  Leaf,
  LucideProps,
  Moon,
  Sun,
} from "lucide-react";
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useSyncExternalStore,
} from "react";
import { Button } from "./ui/button";

type ThemeSwitcherProps = WithClassName;
type ThemeName = keyof typeof themes;

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

type ModeTypes = {
  value: "system" | "light" | "dark";
  label: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

const themeModes: ModeTypes[] = [
  { value: "system", label: "System", icon: Computer },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { setTheme, theme, mode, setMode } = useLayout();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <div className="inline-flex items-center gap-2 rounded p-2 text-sm bg-muted text-foreground">
          <div className="h-4 w-4" />
          <span className="hidden sm:inline">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 border border-muted rounded-lg p-2">
      {/* Theme selection */}
      <div className="flex items-center gap-2">
        {themeNames.map((name) => {
          const meta = themes[name];
          return (
            <Button
              key={name}
              className={cn(
                "inline-flex items-center gap-2 text-sm"
              )}
              variant={theme === name ? "accent" : "muted"}
              disabled={!mounted}
              onClick={() => setTheme(name)}
            >
              {name == 'peeps' ? <Egg className="h-8 w-8" /> : <Leaf className="h-8 w-8" />}
              <span className="hidden sm:inline">{meta.name}</span>
            </Button>
          );
        })}
      </div>
      <div className="flex-grow"/>
      <div className="flex items-center gap-2">
        {themeModes.map((m) => (
          <Button
            key={m.value}
            className={cn(
              "inline-flex items-center gap-2 text-sm"
            )}
            variant={mode === m.value ? "accent" : "muted"}
            disabled={!mounted}
            onClick={() => setMode(m.value)}
          >
            <m.icon className="h-8 w-8" />
            <span className="hidden sm:inline">{m.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
