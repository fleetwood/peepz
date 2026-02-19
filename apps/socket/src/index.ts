import http from 'http'
import path from 'path'
import { parse } from 'url'
import express from 'express'
import { WebSocketServer } from 'ws'
import WebSocketJSONStream from '@teamwork/websocket-json-stream'
import type WebSocket from 'ws'
import ShareDB from 'sharedb'
import ShareDbMongo from 'sharedb-mongo'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { serverEnv } from '@peeps/config/env/node'
import { Logger } from '@peeps/utils'
import { loadRoutes } from './server/loadRoutes'
import { presenceTracker } from './server/presence'

const ROUTES_DIR = path.join(__dirname, 'routes')

const PORT = parseInt(serverEnv.SHAREDB_PORT)

const mongoDb = ShareDbMongo(serverEnv.MONGODB_URI)
const backend = new ShareDB({ db: mongoDb })
const logger      = Logger.instance('Socket:WS')
const supabaseJwks = createRemoteJWKSet(new URL(`${serverEnv.SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

async function getMemberIdFromToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, supabaseJwks, {
      issuer  : `${serverEnv.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

async function bootstrap() {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  await loadRoutes(app, ROUTES_DIR)

  const server = http.createServer(app)
  const wss    = new WebSocketServer({ server })

  function broadcast(topic: string, payload: unknown) {
    const msg = JSON.stringify({ topic, payload })
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) client.send(msg)
    })
  }

  wss.on('connection', async (ws: WebSocket, req) => {
    const { pathname, query } = parse(req.url ?? '', true)
    const token               = typeof query.token === 'string' ? query.token : null
    const memberId            = token ? await getMemberIdFromToken(token) : null

    if (memberId) presenceTracker.add(memberId)

    logger.debug('connection.received', { pathname, memberId: memberId ?? 'anonymous', active: presenceTracker.getCount() })

    ws.send(JSON.stringify({ topic: 'presence', payload: presenceTracker.getCount() }))
    broadcast('presence', presenceTracker.getCount())

    ws.on('close', () => {
      if (memberId) presenceTracker.remove(memberId)
      logger.debug('connection.closed', { active: presenceTracker.getCount() })
      broadcast('presence', presenceTracker.getCount())
    })

    if (pathname === '/sharedb') {
      const stream = new WebSocketJSONStream(ws)
      stream.on('error', (err) => logger.error('stream.error', err))
      backend.listen(stream)
    }
  })

  server.listen(PORT, () => {
    logger.info('server.listen', { port: PORT })
  })
}

bootstrap().catch((error) => {
  logger.error('server.bootstrap', error)
  process.exit(1)
})
