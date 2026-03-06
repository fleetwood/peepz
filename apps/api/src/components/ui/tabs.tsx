'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion, type Variants } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  useHash ?: boolean
  vertical?: boolean
}

const TabsOrientationContext = React.createContext(false)

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ defaultValue, value, onValueChange, useHash = true, vertical = false, className, children, ...props }, ref) => {
  const [activeValue, setActiveValue] = useState<string | undefined>(value || defaultValue)

  // Handle URL hash changes
  useEffect(() => {
    if (!useHash) return

    // Set initial value based on hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && (!value || value !== hash)) {
        setActiveValue(hash)
        if (onValueChange) {
          onValueChange(hash)
        }
      }
    }

    // Check hash on mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [onValueChange, value, useHash])

  // Handle controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setActiveValue(value)
    }
  }, [value])

  // Handle value changes and update URL hash if needed
  const handleValueChange = (newValue: string) => {
    setActiveValue(newValue)
    
    if (newValue && useHash) {
      // Update URL hash without full page navigation
      window.history.pushState(null, '', `#${newValue}`)
    }
    
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <TabsOrientationContext.Provider value={vertical}>
      <TabsPrimitive.Root
        ref={ref}
        value={activeValue}
        onValueChange={handleValueChange}
        orientation={vertical ? 'vertical' : 'horizontal'}
        className={cn(vertical ? 'flex gap-4 items-start' : '', className)}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsOrientationContext.Provider>
  )
})

Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    vertical?: boolean
  }
>(({ className, vertical, ...props }, ref) => {
  const contextVertical = useContext(TabsOrientationContext)
  const isVertical = vertical ?? contextVertical

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'rounded-lg bg-muted p-1 text-muted-foreground',
        isVertical
          ? 'flex min-w-[200px] flex-col gap-1'
          : 'inline-flex h-9 items-center justify-center',
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium',
      'ring-offset-background transition-ease-250',
      'hover:bg-primary hover:text-primary-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const vertical = useContext(TabsOrientationContext)

  const ease = [0.42, 0, 0.58, 1] as const

  const variants: Variants = vertical
    ? {
        active  : { opacity: 1, x: 0, y: 0, transition: { duration: 0.2, ease } },
        inactive: { opacity: 0, x: 0, y: 10, transition: { duration: 0.2, ease } },
      }
    : {
        active  : { opacity: 1, x: 0, y: 0, transition: { duration: 0.3, ease } },
        inactive: { opacity: 0, x: 20, y: 0, transition: { duration: 0.3, ease } },
      }
  
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'ring-offset-background',
        vertical ? 'flex-1' : 'mt-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
      asChild
    >
      <motion.div
        variants={variants}
        initial='inactive'
        animate='active'
        exit='inactive'
      >
        {props.children}
      </motion.div>
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
