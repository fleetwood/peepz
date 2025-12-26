import { HTMLAttributes, ReactNode } from "react"

export type ClassName = HTMLAttributes<any>['className']

export type WithClassName = {
  className?: ClassName
  style    ?: React.CSSProperties
}

export type ReadOnly = {
  readOnly?: boolean
}

export type Disabled = {
  disabled?: boolean
}

export type WithChildren = {
  children: ReactNode
}