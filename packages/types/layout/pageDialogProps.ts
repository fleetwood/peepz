import { PropsWithChildren } from "react";

export type PageDialogProps = PropsWithChildren & {
    title?: React.ReactNode
}

export type PagePopoverAnchor = {
    top   : number
    left  : number
    width : number
    height: number
}

export type PagePopoverProps = PropsWithChildren & {
    title ?: React.ReactNode
    anchor: PagePopoverAnchor
    side  ?: 'top' | 'right' | 'bottom' | 'left'
    align ?: 'start' | 'center' | 'end'
}