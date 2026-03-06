export function decodeOffsetCursor(cursor?: string | null) {
  if (!cursor) return 0

  try {
    // atob decodes base64 to a string
    const raw = atob(cursor)
    const parsed = JSON.parse(raw) as { offset?: number }
    return typeof parsed.offset === 'number' && parsed.offset >= 0 ? parsed.offset : 0
  } catch {
    return 0
  }
}

export function encodeOffsetCursor(offset: number) {
  // btoa encodes a string to base64
  return btoa(JSON.stringify({ offset }))
}