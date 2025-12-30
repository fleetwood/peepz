  /**
 * ANSI color codes for terminal output
 * No external dependencies needed - works natively in Node.js
 */

const RESET = '\x1b[0m'

export const colors = {
    // Regular colors
  black  : (text: string) => `\x1b[30m${text}${RESET}`,
  red    : (text: string) => `\x1b[31m${text}${RESET}`,
  green  : (text: string) => `\x1b[32m${text}${RESET}`,
  yellow : (text: string) => `\x1b[33m${text}${RESET}`,
  blue   : (text: string) => `\x1b[34m${text}${RESET}`,
  magenta: (text: string) => `\x1b[35m${text}${RESET}`,
  cyan   : (text: string) => `\x1b[36m${text}${RESET}`,
  white  : (text: string) => `\x1b[37m${text}${RESET}`,
  
    // Bright colors
  blackBright  : (text: string) => `\x1b[90m${text}${RESET}`,
  redBright    : (text: string) => `\x1b[91m${text}${RESET}`,
  greenBright  : (text: string) => `\x1b[92m${text}${RESET}`,
  yellowBright : (text: string) => `\x1b[93m${text}${RESET}`,
  blueBright   : (text: string) => `\x1b[94m${text}${RESET}`,
  magentaBright: (text: string) => `\x1b[95m${text}${RESET}`,
  cyanBright   : (text: string) => `\x1b[96m${text}${RESET}`,
  whiteBright  : (text: string) => `\x1b[97m${text}${RESET}`,
  
    // Styles
  bold     : (text: string) => `\x1b[1m${text}${RESET}`,
  dim      : (text: string) => `\x1b[2m${text}${RESET}`,
  italic   : (text: string) => `\x1b[3m${text}${RESET}`,
  underline: (text: string) => `\x1b[4m${text}${RESET}`,
  
    // Background colors
  bgCyan  : (text: string) => `\x1b[46m${text}${RESET}`,
  bgYellow: (text: string) => `\x1b[43m${text}${RESET}`,
  bgRed   : (text: string) => `\x1b[41m${text}${RESET}`,
  bgGreen : (text: string) => `\x1b[42m${text}${RESET}`,
} as const

export type ColorName = keyof typeof colors
