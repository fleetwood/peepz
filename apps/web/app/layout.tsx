import "./globals.css"
import { gluten, patrickHand, montserrat, merriweather, domine, fraunces, inconsolata, dmMono } from "./fonts"

import Providers from "@/components/Providers"
import Sidebar from "@/components/layout/Sidebar"
import { WithChildren } from "@peeps/types"
import { themeNames } from "@peeps/ui"

export default function RootLayout({children}:WithChildren) {
  return (
    <html lang="en" data-theme={themeNames[0]} suppressHydrationWarning className={`${gluten.variable} ${patrickHand.variable} ${montserrat.variable} ${merriweather.variable} ${domine.variable} ${fraunces.variable} ${inconsolata.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-page text-page-foreground">
        <Providers>
          <main className="size-full flex overflow-hidden">
            <Sidebar />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
