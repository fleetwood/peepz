import { dmMono, domine, fraunces, gluten, inconsolata, merriweather, montserrat, patrickHand } from "./fonts"
import "./globals.css"

import Providers from "@/components/Providers"
import PageDialog from "@/components/layout/PageDialog"
import Sidebar from "@/components/layout/Sidebar"
import { clientEnv } from "@peeps/config/env"
import { WithChildren } from "@peeps/types"

import logo128 from "@peeps/ui/assets/logo_128.png"
import logo16 from "@peeps/ui/assets/logo_16.png"
import logo32 from "@peeps/ui/assets/logo_32.png"
import logo64 from "@peeps/ui/assets/logo_64.png"
import { type Metadata } from "next"

const SITE_NAME = clientEnv.isDev ? "DEV Peeps" : "Peeps"

export const metadata: Metadata = {
  title: {
    default : SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Peeps",
  metadataBase: new URL("https://peeps.social"),
  icons: {
    icon: [
      { url: logo16.src, sizes: "16x16", type: "image/png" },
      { url: logo32.src, sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: logo128.src, sizes: "128x128", type: "image/png" },
    ],
    other: [
      { rel: "shortcut icon", url: logo32.src },
      { rel: "icon", url: logo64.src, sizes: "64x64", type: "image/png" },
    ],
  },
  openGraph: {
    type       : "website",
    siteName   : SITE_NAME,
    title      : SITE_NAME,
    description: "Peeps",
  },
  twitter: {
    card : "summary_large_image",
    title: SITE_NAME,
  },
}

export default function RootLayout({children}:WithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className={`${gluten.variable} ${patrickHand.variable} ${montserrat.variable} ${merriweather.variable} ${domine.variable} ${fraunces.variable} ${inconsolata.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-page text-page-foreground">
        <Providers>
          <main className="size-full flex overflow-hidden">
            <Sidebar />
            {children}
          </main>
          <footer>
            <PageDialog />
          </footer>
        </Providers>
      </body>
    </html>
  )
}
