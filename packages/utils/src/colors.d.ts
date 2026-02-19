/**
* ANSI color codes for terminal output
* No external dependencies needed - works natively in Node.js
*/
export declare const colors: {
    readonly black: (text: string) => string;
    readonly red: (text: string) => string;
    readonly green: (text: string) => string;
    readonly yellow: (text: string) => string;
    readonly blue: (text: string) => string;
    readonly magenta: (text: string) => string;
    readonly cyan: (text: string) => string;
    readonly white: (text: string) => string;
    readonly blackBright: (text: string) => string;
    readonly redBright: (text: string) => string;
    readonly greenBright: (text: string) => string;
    readonly yellowBright: (text: string) => string;
    readonly blueBright: (text: string) => string;
    readonly magentaBright: (text: string) => string;
    readonly cyanBright: (text: string) => string;
    readonly whiteBright: (text: string) => string;
    readonly bold: (text: string) => string;
    readonly dim: (text: string) => string;
    readonly italic: (text: string) => string;
    readonly underline: (text: string) => string;
    readonly bgCyan: (text: string) => string;
    readonly bgYellow: (text: string) => string;
    readonly bgRed: (text: string) => string;
    readonly bgGreen: (text: string) => string;
};
export type ColorName = keyof typeof colors;
//# sourceMappingURL=colors.d.ts.map