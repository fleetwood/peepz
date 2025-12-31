"use client"

import * as React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QueryManager } from '@peeps/client'

const queryClient = new QueryClient()
QueryManager.init(queryClient)

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
