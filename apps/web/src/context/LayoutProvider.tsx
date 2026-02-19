"use client";

import { PageDialogProps, PagePopoverProps, WithChildren } from "@peeps/types";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { createContext, useContext } from "react";
import { useThemeStore } from "../stores/themeStore";

type LayoutContextType = {
  theme       : string | undefined;
  colorTheme  : string;
  mode        : 'light' | 'dark' | 'system';
  isWarmTheme : boolean;
  isPeepsTheme: boolean;
  isSystemMode: boolean;
  isDarkMode  : boolean;
  isLightMode : boolean;
  navigate    : (path: string) => void;
  pathname    : string;

  setDialog   : (props:PageDialogProps) => void;
  closeDialog : () => void;
  dialog      ?: PageDialogProps;
  
  setPopover  : (props:PagePopoverProps) => void;
  closePopover: () => void;
  popover     ?: PagePopoverProps;

  setTheme    : (theme: string) => void;
  setMode     : (mode: 'light' | 'dark' | 'system') => void;
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
  const [dialog, _setDialog] = React.useState<PageDialogProps | undefined>();
  const [popover, _setPopover] = React.useState<PagePopoverProps | undefined>();
  // Use Zustand store for theme management
  const { theme, mode, setTheme, setMode, getColorTheme } = useThemeStore();
  
  const colorTheme   = getColorTheme();
  const isWarmTheme  = colorTheme === 'warm';
  const isSystemMode = mode       === 'system'
  const isDarkMode   = mode       === 'dark'
  const isLightMode  = !isDarkMode

  const setDialog = (t: PageDialogProps) => {
    _setDialog(t)
  }
  const closeDialog = () => {
    _setDialog(undefined)
  }

  const setPopover = (t: PagePopoverProps) => {
    _setPopover(t)
  }
  const closePopover = () => {
    _setPopover(undefined)
  }

  const navigate = (path: string) => {
    router.push(path);
  };

  const values: LayoutContextType = {
    theme,
    colorTheme,
    mode,
    isWarmTheme,
    isPeepsTheme: !isWarmTheme,
    isSystemMode,
    isDarkMode,
    isLightMode,
    navigate,
    pathname,

    setDialog,
    closeDialog,
    dialog,
    
    setPopover,
    closePopover,
    popover,
    
    setTheme,
    setMode
  };

  return (
    <ThemeProviderWrapper>
      <LayoutProviderComponent values={values}>{children}</LayoutProviderComponent>
    </ThemeProviderWrapper>
  );
};

// Simple wrapper to apply CSS classes based on Zustand store
function ThemeProviderWrapper({ children }: WithChildren) {
  const { theme, mode, getCombinedTheme } = useThemeStore();
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const fallbackTheme = 'peeps'
  const fallbackMode  = 'system'

  if (!mounted) {
    return (
      <div className={`h-full ${fallbackTheme}`} data-theme={fallbackTheme} data-mode={fallbackMode}>
        {children}
      </div>
    )
  }

  const combinedTheme = getCombinedTheme();
  const dataTheme     = theme.split('-')[0] || theme

  return (
    <div className={`h-full ${combinedTheme}`} data-theme={dataTheme} data-mode={mode}>
      {children}
    </div>
  );
}

LayoutProvider.displayName = "LayoutProvider";
export default LayoutProvider;
