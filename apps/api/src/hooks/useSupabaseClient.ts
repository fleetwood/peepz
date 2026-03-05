"use client"

import * as React from 'react'
import { SupabaseClient } from '@peeps/client'

export function useSupabaseClient() {
  return React.useMemo(() => SupabaseClient.get(), [])
}
