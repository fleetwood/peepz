/**
* ANSI color codes for terminal output
* No external dependencies needed - works natively in Node.js
*/
const RESET = '\x1b[0m';
export const colors = {
    // Regular colors
    black: (text) => `\x1b[30m${text}${RESET}`,
    red: (text) => `\x1b[31m${text}${RESET}`,
    green: (text) => `\x1b[32m${text}${RESET}`,
    yellow: (text) => `\x1b[33m${text}${RESET}`,
    blue: (text) => `\x1b[34m${text}${RESET}`,
    magenta: (text) => `\x1b[35m${text}${RESET}`,
    cyan: (text) => `\x1b[36m${text}${RESET}`,
    white: (text) => `\x1b[37m${text}${RESET}`,
    // Bright colors
    blackBright: (text) => `\x1b[90m${text}${RESET}`,
    redBright: (text) => `\x1b[91m${text}${RESET}`,
    greenBright: (text) => `\x1b[92m${text}${RESET}`,
    yellowBright: (text) => `\x1b[93m${text}${RESET}`,
    blueBright: (text) => `\x1b[94m${text}${RESET}`,
    magentaBright: (text) => `\x1b[95m${text}${RESET}`,
    cyanBright: (text) => `\x1b[96m${text}${RESET}`,
    whiteBright: (text) => `\x1b[97m${text}${RESET}`,
    // Styles
    bold: (text) => `\x1b[1m${text}${RESET}`,
    dim: (text) => `\x1b[2m${text}${RESET}`,
    italic: (text) => `\x1b[3m${text}${RESET}`,
    underline: (text) => `\x1b[4m${text}${RESET}`,
    // Background colors
    bgCyan: (text) => `\x1b[46m${text}${RESET}`,
    bgYellow: (text) => `\x1b[43m${text}${RESET}`,
    bgRed: (text) => `\x1b[41m${text}${RESET}`,
    bgGreen: (text) => `\x1b[42m${text}${RESET}`,
};
