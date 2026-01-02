"use client";

import { PageDialogProps, WithChildren } from "@peeps/types";
import { themeNames } from "@peeps/ui";
import { ThemeProvider, useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, createContext, useContext } from "react";

type LayoutContextType = {
  theme       : string | undefined;
  isWarmTheme : boolean;
  isPeepsTheme: boolean;
  navigate    : (path: string) => void;
  pathname    : string;
  setDialog   : (props:PageDialogProps) => void;
  closeDialog : () => void;
  dialog      ?: PageDialogProps
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

const LayoutProviderComponent = ({ children, values }: { children: React.ReactNode; values: LayoutContextType }) => {
  return (
    <LayoutContext.Provider value={values}>
      {children}
    </LayoutContext.Provider>
  );
};

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [dialog, _setDialog] = React.useState<PageDialogProps | undefined>();

  const isWarmTheme = Boolean(theme?.includes("warm"));

  const setDialog = (t: PageDialogProps) => {
    _setDialog(t)
  }
  const closeDialog = () => {
    _setDialog(undefined)
  }

  const navigate = (path: string) => {
    router.push(path);
  };

  const values: LayoutContextType = {
    theme,
    isWarmTheme,
    isPeepsTheme: !isWarmTheme,
    navigate,
    pathname,
    setDialog,
    closeDialog,
    dialog,
  };

  return (
    <ThemeProvider
      attribute="data-theme-raw"
      themes={themeNames}
      defaultTheme="peeps"
      enableSystem={false}
      storageKey="theme"
    >
      <ThemeModeHandler>
        <LayoutProviderComponent values={values}>{children}</LayoutProviderComponent>
      </ThemeModeHandler>
    </ThemeProvider>
  );
};

// Helper component to handle data-mode attribute
function ThemeModeHandler({ children }: WithChildren) {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme) {
      const html = document.documentElement;
      const parts = theme.split("-");

      console.log("ThemeModeHandler: theme=", theme, "parts=", parts);

      if (parts.length === 2) {
        // New format: "peeps-dark" or "warm-light"
        // Set theme name only, mode separately
        console.log("Setting data-theme=", parts[0], "data-mode=", parts[1]);
        html.setAttribute("data-theme", parts[0]);
        html.setAttribute("data-mode", parts[1]);
      } else if (theme === "light" || theme === "dark") {
        // Legacy format: "light" or "dark" - default to peeps theme
        console.log("Setting data-theme=peeps", "data-mode=", theme);
        html.setAttribute("data-theme", "peeps");
        html.setAttribute("data-mode", theme);
      } else {
        // Single theme name: "peeps" or "warm"
        console.log("Setting data-theme=", theme, "data-mode=light");
        html.setAttribute("data-theme", theme);
        html.setAttribute("data-mode", "light");
      }
    }
  }, [theme]);

  return <>{children}</>;
}

LayoutProvider.displayName = "LayoutProvider";
export default LayoutProvider;
