'use client'

import { cn, cva } from '@/lib/utils'
import { ReadOnly, WithVariant } from '@peeps/types'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'

type ChooserVariant = WithVariant<
  'primary' | 'secondary' | 'accent' | 'muted' | 'ghost' | 'danger' | 'disabled'
>

type RenderChooserProps<T> = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'value' | 'defaultValue'
> & ReadOnly & {
  value        ?: T
  childrenArray : React.ReactNode[]
  currentValue ?: T
  pointValue   ?: T
}

type ChooserContextType<T> = ChooserVariant & {
  value        ?: T
  onValueChange?: (value: T) => void
  readOnly     ?: boolean
  size         ?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  compact      ?: boolean
  pointValue   ?: T
}

export type ChooserProps<T> = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'value' | 'defaultValue'
> & ReadOnly & ChooserVariant & {
  value        ?: T
  onValueChange?: (value: T) => void
  defaultValue ?: T
  size         ?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fit          ?: 'fit' | 'stretch' | 'compact'
  pointValue   ?: T
}

export type ChooseItemProps<T> = Omit<React.ComponentPropsWithoutRef<'div'>, 'value'> & ReadOnly & {
  value: T
  point?: boolean
}

// TODO: Make this more responsive, perhaps by adjusting text size based on fit
const chooseItemVariants = cva(
  'flex flex-shrink items-center justify-center transition-ease-200 rounded-full cursor-pointer text-nowrap',
  {
    variants: {
      variant: {
        primary  : 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent   : 'bg-accent text-accent-foreground',
        muted    : 'bg-muted text-muted-foreground',
        ghost    : 'bg-transparent text-foreground',
        danger   : 'bg-danger text-danger-foreground',
        disabled : 'bg-muted text-muted-foreground cursor-default',
      },

      size: {
        xs: 'text-xs p-0.5',
        sm: 'text-sm p-1',
        md: 'text-base p-2',
        lg: 'text-lg p-2.5',
        xl: 'text-xl p-3',
      },
      compact: {
        true: 'text-xs p-1',
        false: '',
      }
    },
    defaultVariants: {
      size: 'md',
      compact: false,
    },
  }
)

const hoverVariants = cva('text-nowrap', {
  variants: {
    variant: {
      primary  : 'hover:bg-primary/50 hover:text-primary-foreground',
      secondary: 'hover:bg-secondary/50 hover:text-secondary-foreground',
      accent   : 'hover:bg-accent/50 hover:text-accent-foreground',
      muted    : 'hover:bg-muted/50 hover:text-muted-foreground',
      ghost    : 'hover:bg-muted/30 hover:text-foreground',
      danger   : 'hover:bg-danger/50 hover:text-danger-foreground',
      disabled : '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})


const chooserVariants = cva(
  'relative flex items-center rounded-full border-none bg-muted transition-all focus-within:outline-none',
  {
    variants: {
      size: {
        xs: 'text-xs p-0.5',
        sm: 'text-sm p-1',
        md: 'text-base p-2',
        lg: 'text-lg p-2.5',
        xl: 'text-xl p-3',
      },
      fit: {
        fit    : 'h-fit w-fit gap-2',
        stretch: 'h-full w-full justify-between',
        compact: 'h-fit w-fit text-xs',
      },

    },
    defaultVariants: {
      size: 'md',
      fit : 'fit'
    },
  }
)

const ChooserContext = React.createContext<ChooserContextType<any>>({})

function Chooser<T>({
  className,
  children,
  value,
  onValueChange,
  defaultValue,
  readOnly,
  size,
  fit,
  variant,
  pointValue,
  ...props
}: ChooserProps<T>) {
  const currentValue = value ?? defaultValue
  const childrenArray = React.Children.toArray(children)
  return (
    <ChooserContext.Provider
      value={{
        value: currentValue,
        onValueChange: readOnly ? undefined : onValueChange,
        variant: variant || 'primary',
        readOnly,
        size,
        pointValue
      }}
    >
      {childrenArray.length === 2 ? (
        <DualChooser
          className={cn(chooserVariants({ size, fit }), className)}
          value={currentValue}
          childrenArray={childrenArray}
          currentValue={currentValue}
          {...props}
        />
      ) : (
        <MultiChooser
          className={cn(chooserVariants({ size, fit }), className)}
          value={currentValue}
          childrenArray={childrenArray}
          currentValue={currentValue}
          {...props}
        />
      )}
    </ChooserContext.Provider>
  )
}
Chooser.displayName = 'Chooser'

function DualChooser<T>({
  className,
  childrenArray,
  value,
  currentValue,
  readOnly,
  ...props
}: RenderChooserProps<T>) {
  const firstSelected = currentValue === (childrenArray[0] as any).props.value
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-between rounded-full border border-input bg-background text-sm focus-within:outline-none',
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between relative gap-2">
        {childrenArray[0]}
        <ChevronLeft
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-all duration-200 text-primary',
            firstSelected ? 'rotate-0' : 'rotate-180'
          )}
        />
        {childrenArray[1]}
      </div>
    </div>
  )
}

function MultiChooser<T>({
  className,
  childrenArray,
  value,
  currentValue,
  readOnly,
  ...props
}: RenderChooserProps<T>) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-between rounded-full border border-input bg-background focus-within:outline-none',
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between relative gap-2">
        {childrenArray.map((child, index) => {
          const childElement = child as React.ReactElement
          if (React.isValidElement(childElement) && typeof childElement.type !== 'string') {
            return (
              <div key={childElement.key ?? index} className="flex-1">
                {childElement}
              </div>
            )
          }
          return child
        })}
      </div>
    </div>
  )
}

const ChooseItem = React.forwardRef<HTMLDivElement, ChooseItemProps<any>>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, pointValue: contextPointValue, readOnly: contextReadOnly, variant = 'primary', size = 'md', compact = false } = React.useContext(ChooserContext)
    const isSelected = value === selectedValue
    const readOnly = props.readOnly || contextReadOnly
    const point = props.point || contextPointValue === value
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={readOnly ? undefined : () => onValueChange?.(value)}
        onKeyDown={readOnly ? undefined : e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onValueChange?.(value)
          }
        }}
        className={cn(
          chooseItemVariants({
            variant: readOnly ? 'disabled' : isSelected ? variant : undefined,
            size,
            compact
          }),
          !isSelected && !readOnly && hoverVariants({ variant }),
          !isSelected && readOnly && 'text-foreground/50',
          point && 'triangle',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ChooseItem.displayName = 'ChooseItem'
export { ChooseItem, Chooser }

