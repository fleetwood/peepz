import type { ReactNode } from 'react'

import { Spinner } from '../ui/spinner'

export type AsyncContainerProps = {
    isLoading?: boolean[]
    error    ?: Array<Error | { message?: unknown } | string | null>
    fallback ?: ReactNode
    children  : ReactNode
}

const AsyncContainer = (props:AsyncContainerProps) => {
    const isLoading = props.isLoading?.some((l) => l) ?? false

    const errors = (props.error ?? []).filter(Boolean).map((err) => {
        if (typeof err === 'string') return err
        if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
        return String(err)
    })

    if (isLoading) return props.fallback ?? <Spinner />

    if (errors.length > 0) {
        return (
            <div className="grid gap-2">
                {errors.map((message, index) => (
                    <div key={index} className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                        {message}
                    </div>
                ))}
            </div>
        )
    }

    return props.children
}

AsyncContainer.displayName = "AsyncContainer"
export default AsyncContainer
