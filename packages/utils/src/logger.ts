/**
 * Simple logger utility for debugging
 */
export class Logger {
  private name: string
  private enabled: boolean

  private constructor(name: string, enabled: boolean = true) {
    this.name = name
    this.enabled = enabled
  }

  static instance(name: string, enabled: boolean = true): Logger {
    return new Logger(name, enabled)
  }

  debug(...args: any[]): void {
    if (this.enabled) {
      console.debug(`[${this.name}]`, ...args)
    }
  }

  info(...args: any[]): void {
    if (this.enabled) {
      console.info(`[${this.name}]`, ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn(`[${this.name}]`, ...args)
    }
  }

  error(...args: any[]): void {
    if (this.enabled) {
      console.error(`[${this.name}]`, ...args)
    }
  }
}
