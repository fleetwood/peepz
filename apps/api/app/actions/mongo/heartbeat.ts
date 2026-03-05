"use server"

import { MongoService } from '@peeps/services'

export async function mongoHeartbeat() {
  return MongoService.heartbeat()
}
