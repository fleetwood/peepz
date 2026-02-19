import { Router } from 'express'
import { z } from 'zod'
import { MongoService } from '@peeps/services/integrations/MongoService'
import { ValidationSourceEnum } from '@peeps/types'
import { serverEnv } from '@peeps/config/env'
import { presenceTracker } from '../../server/presence'
import { ExApiRoute } from '../../server/ExApiRoute'
import { Logger } from '@peeps/utils'

const logger = Logger.instance('heartbeat')

const router = Router()

router.get('/', async (req, res) => {
  logger.debug('GET /')
  await new ExApiRoute(req, res).handle(async () => {
    const port = parseInt(serverEnv.SHAREDB_PORT)
    const heartbeat = await MongoService.heartbeat()
    return { ...heartbeat, port, presence: presenceTracker.getCount() }
  })
})

router.post('/', async (req, res) => {
  logger.debug('POST /')
  await new ExApiRoute(req, res)
    .auth()
    .validate(ValidationSourceEnum.BODY, z.object({ message: z.string().optional() }))
    .handle(async ({ validated }) => {
      const { message } = validated.body as { message?: string }
      const result      = await MongoService.heartbeat()
      return { ...result, message }
    })
})

export default router
