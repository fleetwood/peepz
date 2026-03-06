export type PageDialogProps = {
    title   ?: string
    children?: unknown
}

export type PagePopoverAnchor = {
    top   : number
    left  : number
    width : number
    height: number
}

export type PagePopoverProps = {
    title   ?: string
    anchor  : PagePopoverAnchor
    side    ?: 'top' | 'right' | 'bottom' | 'left'
    align   ?: 'start' | 'center' | 'end'
    children?: unknown
}