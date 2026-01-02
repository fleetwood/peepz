"use client"

import { CurrentUserProvider } from "@/context/CurrentUserProvider"
import LayoutProvider from "@/context/LayoutProvider"
import QueryProvider from "@/context/QueryProvider"
import { WithChildren } from "@peeps/types"

type ProvidersProps = WithChildren

const Providers = (props:ProvidersProps) => {
    return (
        <LayoutProvider>
            <QueryProvider>
                <CurrentUserProvider>
                    {props.children}
                </CurrentUserProvider>
            </QueryProvider>
        </LayoutProvider>
    )
}

Providers.displayName = "Providers"
export default Providers