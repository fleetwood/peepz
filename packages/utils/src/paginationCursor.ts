import { Buffer } from 'buffer'

export function decodeOffsetCursor(cursor?: string | null) {
  if (!cursor) return 0

  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8')
    const parsed = JSON.parse(raw) as { offset?: number }
    return typeof parsed.offset === 'number' && parsed.offset >= 0 ? parsed.offset : 0
  } catch {
    return 0
  }
}

export function encodeOffsetCursor(offset: number) {
  return Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64')
}
