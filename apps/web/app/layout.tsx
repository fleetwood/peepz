import './globals.css'

import Providers from '@/components/Providers'
import ThemeSwitcher from '@/components/ThemeSwitcher'

import type { ReactNode } from 'react'

import { cookies } from 'next/headers'

import { materializeTheme, themes } from '@peeps/ui'

function toCssVars(themeName: 'light' | 'dark') {
  const theme = materializeTheme(themes[themeName])
  const brand = theme.colors.brand as Record<string, string>
  const semantic = theme.colors.semantic as Record<string, string>

  return [
    `--background:${brand.page}`,
    `--foreground:${brand['page-foreground']}`,
    `--card:${brand.page}`,
    `--card-foreground:${brand['page-foreground']}`,
    `--popover:${brand.page}`,
    `--popover-foreground:${brand['page-foreground']}`,
    `--muted:${brand.secondary}`,
    `--muted-foreground:${brand['secondary-foreground']}`,
    `--border:${brand.secondary}`,
    `--input:${brand.secondary}`,
    `--ring:${brand.accent}`,
    `--destructive:${semantic.danger}`,
    `--destructive-foreground:${semantic['danger-foreground']}`,
    `--primary:${brand.primary}`,
    `--primary-foreground:${brand['primary-foreground']}`,
    `--secondary:${brand.secondary}`,
    `--secondary-foreground:${brand['secondary-foreground']}`,
    `--accent:${brand.accent}`,
    `--accent-foreground:${brand['accent-foreground']}`,
    `--success:${semantic.success}`,
    `--success-foreground:${semantic['success-foreground']}`,
    `--warning:${semantic.warning}`,
    `--warning-foreground:${semantic['warning-foreground']}`,
    `--danger:${semantic.danger}`,
    `--danger-foreground:${semantic['danger-foreground']}`,
    `--info:${semantic.info}`,
    `--info-foreground:${semantic['info-foreground']}`,
  ].join(';')
}

const themeCss = [
  `:root[data-theme="light"]{${toCssVars('light')}}`,
  `:root[data-theme="dark"]{${toCssVars('dark')}}`,
].join('\n')

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const cookieTheme = cookieStore.get('theme')?.value
  const initialTheme = cookieTheme === 'dark' ? 'dark' : 'light'

  return (
    <html lang="en" data-theme={initialTheme}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <div style={{ padding: 12 }}>
            <ThemeSwitcher />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
