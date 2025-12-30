import { ErrorCodeEnum, errorCodeToMessage, errorCodeToStatusCode } from '@peeps/types/base/errorCodes'

type ApiErrorLike = {
    error?      : unknown
    statusCode? : unknown
    statusText? : unknown
    code?       : unknown
    errorDetails?: unknown
}

export type PageErrorProps = {
    error: Error | ApiErrorLike | string | null
}

const PageError = (props:PageErrorProps) => {
    const code = (() => {
        const err = props.error
        if (!err) return null

        if (typeof err === 'object' && 'code' in err) {
            const maybe = (err as { code?: unknown }).code
            if (typeof maybe === 'string' && Object.values(ErrorCodeEnum).includes(maybe as ErrorCodeEnum)) {
                return maybe as ErrorCodeEnum
            }
        }

        if (typeof err === 'string') {
            const match = err.match(/CD\d{4}/)
            if (match && Object.values(ErrorCodeEnum).includes(match[0] as ErrorCodeEnum)) return match[0] as ErrorCodeEnum
        }

        if (err instanceof Error) {
            const match = err.message.match(/CD\d{4}/)
            if (match && Object.values(ErrorCodeEnum).includes(match[0] as ErrorCodeEnum)) return match[0] as ErrorCodeEnum
        }

        if (typeof err === 'object' && 'message' in err) {
            const match = String((err as { message?: unknown }).message ?? '').match(/CD\d{4}/)
            if (match && Object.values(ErrorCodeEnum).includes(match[0] as ErrorCodeEnum)) return match[0] as ErrorCodeEnum
        }

        return null
    })()

    const statusCode = (() => {
        const err = props.error
        if (!err || typeof err !== 'object') return null
        if (!('statusCode' in err)) return null

        const value = (err as ApiErrorLike).statusCode
        return typeof value === 'number' ? value : null
    })()

    const message = (() => {
        const err = props.error
        if (!err) return null
        if (typeof err === 'string') return err
        if (err instanceof Error) return err.message
        if (typeof err === 'object' && 'error' in err) return String((err as ApiErrorLike).error)
        if (typeof err === 'object' && 'message' in err) return String((err as { message?: unknown }).message)
        return String(err)
    })()

    const title = (() => {
        if (code) {
            const status = errorCodeToStatusCode[code]
            if (status === 404) return 'Not found'
            if (status === 401) return 'Not signed in'
            if (status === 403) return 'Not allowed'
            if (status === 400) return 'Something looks off'
            if (status >= 500) return 'Server error'
        }

        if (statusCode) {
            if (statusCode === 404) return 'Not found'
            if (statusCode === 401) return 'Not signed in'
            if (statusCode === 403) return 'Not allowed'
            if (statusCode === 400) return 'Something looks off'
            if (statusCode >= 500) return 'Server error'
        }

        if (!message) return 'Something went wrong'
        const normalized = message.toLowerCase()

        if (normalized.includes('404') || normalized.includes('not found')) return 'Not found'
        if (normalized.includes('401') || normalized.includes('unauthorized')) return 'Not signed in'
        if (normalized.includes('403') || normalized.includes('forbidden')) return 'Not allowed'
        if (normalized.includes('400') || normalized.includes('bad request')) return 'Something looks off'
        if (normalized.includes('500') || normalized.includes('internal')) return 'Server error'

        return 'Something went wrong'
    })()

    const friendlyMessage = (code ? errorCodeToMessage[code] : null) ?? message ?? 'Please try again.'

    return (
        <div className="w-full rounded-xl border border-border p-6 bg-danger text-danger-foreground">
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-2 text-sm">{friendlyMessage}</div>
        </div>
    )
}

PageError.displayName = "PageError"
export default PageError