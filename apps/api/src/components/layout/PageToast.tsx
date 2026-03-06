'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type PageToastProps = React.ComponentProps<typeof Sonner>

const PageToast = ({ ...props }: PageToastProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as PageToastProps['theme']}
      className="PageToast group"
      toastOptions={{
        classNames: {
          toast: 'group toast toast-bg group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'toast-success-bg',
          error: 'toast-error-bg',
          info: 'toast-info-bg'
        }
      }}
      {...props}
    />
  )
}

PageToast.displayName = "PageToast"
export { PageToast }
