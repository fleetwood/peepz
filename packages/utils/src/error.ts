export const errMessage = (err: unknown, msg: string = 'Unknown error'): string => {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as any).message)
  }
  return msg
}
