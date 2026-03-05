"use client"

import { CurrentUserProvider } from "@/context/CurrentUserProvider"
import LayoutProvider from "@/context/LayoutProvider"
import QueryProvider from "@/context/QueryProvider"
import { SocketProvider } from "@/context/SocketProvider"
import { WithChildren } from "@peeps/types"

type ProvidersProps = WithChildren

const Providers = (props:ProvidersProps) => {
    return (
        <LayoutProvider>
            <QueryProvider>
                <SocketProvider>
                    <CurrentUserProvider>
                        {props.children}
                    </CurrentUserProvider>
                </SocketProvider>
            </QueryProvider>
        </LayoutProvider>
    )
}

Providers.displayName = "Providers"
export default Providers