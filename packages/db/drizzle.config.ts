import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load .env from project root
config({ path: '../../.env' })

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing required environment variable: DATABASE_URL')
  }
  return url
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  verbose: true,
  strict: true,
})
