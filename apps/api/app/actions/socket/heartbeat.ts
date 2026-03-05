"use server"

import { serverEnv } from '@peeps/config/env'
import type { ShareDbHeartbeatResult } from '@peeps/types'
import { SocketRestApi } from '@peeps/utils/fetch/socket'

export async function shareDbHeartbeat(): Promise<ShareDbHeartbeatResult> {
  const port = parseInt(serverEnv.SHAREDB_PORT)
  try {
    const { data, error } = await SocketRestApi.fetch<ShareDbHeartbeatResult>('/heartbeat')
    if (error || !data) throw new Error(error ?? 'No data')
    return { ok: true, port: data.port ?? port, presence: data.presence }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, port, error: message }
  }
}
