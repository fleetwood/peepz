"use client"

import * as React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QueryManager } from '@peeps/client'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = React.useState(() => {
    const client = new QueryClient()
    QueryManager.init(client)
    return client
  })

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
