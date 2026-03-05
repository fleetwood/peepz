"use server"

import { shareDbHeartbeat } from './heartbeat'

export async function shareDbPresence(): Promise<number> {
  const heartbeat = await shareDbHeartbeat()
  return heartbeat.presence ?? 0
}
