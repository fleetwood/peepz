export function CLI_ENV() {
  const proc = (globalThis as any).process as { env?: Record<string, string | undefined> } | undefined
  if (!proc?.env) return
  if (proc.env.VERCEL) return

  return
}
