"use client"

import * as React from 'react'
import { SocketClient } from '@peeps/client'
import { PresenceDomain } from '@peeps/types'

SocketClient.createWeb()

type SocketContextValue = {
  presenceCount: number
}

const SocketContext = React.createContext<SocketContextValue>({ presenceCount: 0 })

export function useSocket() {
  return React.useContext(SocketContext)
}

let   presenceSnapshot = 0
const presenceSubscribers = new Set<() => void>()

SocketClient.on<number>(PresenceDomain.global().topic, (count) => {
  presenceSnapshot = count
  presenceSubscribers.forEach((fn) => fn())
})

function subscribeToPresence(cb: () => void) {
  presenceSubscribers.add(cb)
  return () => presenceSubscribers.delete(cb)
}

function getPresenceSnapshot() {
  return presenceSnapshot
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const presenceCount = React.useSyncExternalStore(
    subscribeToPresence,
    getPresenceSnapshot,
    () => 0,
  )

  return (
    <SocketContext.Provider value={{ presenceCount }}>
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.displayName = 'SocketProvider'

export function useFamilyPresence(groupId: string): number {
  const topic    = React.useMemo(() => PresenceDomain.family({ groupId }).topic, [groupId])
  const snapshot = React.useRef(0)

  return React.useSyncExternalStore(
    (notify) => {
      const listener = (count: number) => {
        snapshot.current = count
        notify()
      }
      SocketClient.on<number>(topic, listener)
      return () => SocketClient.off<number>(topic, listener)
    },
    () => snapshot.current,
    () => 0,
  )
}