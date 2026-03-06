export type ClassName = string | undefined

export type WithClassName = {
  className?: ClassName
  style    ?: Record<string, string | number>
}

export type ReadOnly = {
  readOnly?: boolean
}

export type Disabled = {
  disabled?: boolean
}

export type WithChildren = {
  children?: unknown
}

export type TVariant           = 'primary' | 'secondary' | 'accent' | 'muted' | 'ghost' | 'outline' | 'warning' | 'danger' | 'success' | 'info' | 'disabled'
export type SemanticVariant    = WithVariant<'primary' | 'secondary' | 'accent' | 'disabled'>
export type ExtSemanticVariant = WithVariant<'primary' | 'secondary' | 'accent' | 'muted' | 'ghost' | 'outline' | 'disabled'>
export type StatusVariant      = WithVariant<'warning' | 'danger' | 'success' | 'info'>
export type Variant            = WithVariant<TVariant>

export type WithVariant<T extends TVariant> = {
  variant?: T
}
