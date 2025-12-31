"use client"

import { CurrentUserProvider } from "@/context/CurrentUserProvider"
import QueryProvider from "@/context/QueryProvider"
import { WithChildren } from "@peeps/types"
import { themeNames } from "@peeps/ui"
import { ThemeProvider } from "next-themes"

type ProvidersProps = WithChildren

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