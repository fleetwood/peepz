import { CurrentUserProvider } from "@/context/CurrentUserProvider"
import QueryProvider from "@/context/QueryProvider"

export type ProvidersProps = {
    children: React.ReactNode
}

const Providers = (props:ProvidersProps) => {
    return (
        <QueryProvider>
            <CurrentUserProvider>
                {props.children}
            </CurrentUserProvider>
        </QueryProvider>
    )
}

Providers.displayName = "Providers"
export default Providers