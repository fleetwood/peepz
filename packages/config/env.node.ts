import path from 'path'
import { configDotenv } from 'dotenv'

const MONOREPO_ROOT = path.resolve(__dirname, '../..')

configDotenv({ path: path.join(MONOREPO_ROOT, '.env.local'), override: false })
configDotenv({ path: path.join(MONOREPO_ROOT, '.env'),       override: false })

export * from './env'
