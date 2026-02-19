import { serverEnv } from '@peeps/config/env'
import { Logger } from '../logger'

import { FetchBase } from './FetchBase'

const logger = Logger.instance('SocketRestApi')

const { SHAREDB_PORT, API_KEY } = serverEnv

export const SocketRestApi = new FetchBase({
  apiKey   : API_KEY,
  apiPrefix: '',
  baseUrl  : `http://localhost:${SHAREDB_PORT}`,
})
