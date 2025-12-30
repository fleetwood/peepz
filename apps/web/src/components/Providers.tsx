"use client"

import { CurrentUserProvider } from "@/context/CurrentUserProvider"
import QueryProvider from "@/context/QueryProvider"
import { themeNames } from "@peeps/ui"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

export type ProvidersProps = {
    children: ReactNode
}

const Providers = (props:ProvidersProps) => {
    return (
        <ThemeProvider attribute="data-theme" themes={themeNames} defaultTheme={themeNames[0]} enableSystem={false} storageKey="theme">
            <QueryProvider>
                <CurrentUserProvider>
                    {props.children}
                </CurrentUserProvider>
            </QueryProvider>
        </ThemeProvider>
    )
}

Providers.displayName = "Providers"
export default Providers