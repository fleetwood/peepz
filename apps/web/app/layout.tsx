import "./globals.css"

import Providers from "@/components/Providers"
import Sidebar from "@/components/layout/Sidebar"
import { WithChildren } from "@peeps/types"
import { themeNames } from "@peeps/ui"

export default function RootLayout({children}:WithChildren) {
  return (
    <html lang="en" data-theme={themeNames[0]} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <main className="size-full flex bg-background overflow-hidden">
            <Sidebar />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
