import { clientEnv } from '@peeps/config/env'
import { ErrorCodeEnum } from '@peeps/types'
import { colors } from './colors'

/*

LOGGING RULES

1. ALWAYS USE LOGGER, NEVER CONSOLE
   - Use the Logger class for all logging
   - Never use console.log, console.error, etc.

   - Refrain from using inline comments where the code is easily readable
   
   - When adding comments, NEVER put comment at the end of a line
     const foo = 'bar' // This is a bad comment
   - When adding comments, ALWAYS put comments above the line
     // This is accepable comment
     const foo = 'bar'

2. LOGGER INSTANCE
   // For services/classes
   private logger = Logger.instance('ServiceName', false)
   
   // For modules
   const logger = Logger.instance('ModuleName', false)

3. LOGGING PATTERN
   - Use debug() for function entry/exit and debug information
   - Use info() for important business events
   - Use error() for errors that need attention
   - Use warn() for warnings
   - Use success() for successful operations

4. FUNCTION LOGGING
   a. At function start:
      - Always log function name and input parameters
      - Use debug level
      - Example:
        this.logger.debug('functionName', { param1, param2 })

   b. At function completion:
      - Log function name and result
      - Use debug level
      - Example:
        this.logger.debug('functionName complete', { result })

   c. For errors:
      - Always include the error object
      - Use error level
      - Example:
        this.logger.error('functionName', error)

5. LOG FORMAT
   - First argument: Function or operation name as string
   - Second argument: Plain object with relevant data
   - Let the logger handle formatting

EXAMPLE:
   async function fetchUser(userId: string) {
       this.logger.debug('fetchUser', { userId })
       try {
           const user = await userRepository.find(userId)
           this.logger.debug('fetchUser complete', { user })
           return user
       } catch (error) {
           this.logger.error('fetchUser', error)
           throw error
       }
   }
*/

// find all that are not false Logger\.instance\('([^']*)'\)

  // Define log levels and their numeric values
export enum LogLevel {
    NONE    = 0,
    ERROR   = 1,
    WARN    = 2,
    INFO    = 3,
    SUCCESS = 4,
    DEBUG   = 5
}

  // Parse LOG_LEVELS from environment or use default
const getLogLevel = (): LogLevel => {
    const  envLevel       = clientEnv.LOG_LEVEL
    const  level          = LogLevel[envLevel as keyof typeof LogLevel]
    return typeof level === 'number' ? level : LogLevel.ERROR
}

    /**
     * Logger class to handle logging messages to the console.
     *
     * Logging messages will be prefixed with the filename of the module
     * that created the logger instance.
     *
     * @example
     * const logger = Logger.instance('myModule', false)
     * logger.info('Hello world')
     * // Output: [myModule] ℹ️ Hello world
     *
     * @param filename - The filename to use as the log prefix
     * @param active - Whether or not to log messages (default: true)
     * @returns A Logger instance
     */
export class Logger {
    /**
     * A map of filename to Logger instance.
     *
     * This is a static map that stores all created Logger instances.
     * The key is the filename that was used to create the Logger instance,
     * and the value is the Logger instance itself.
     *
     * This is used to ensure that only one Logger instance is created per
     * filename, and to keep track of the active state of each Logger instance.
     * 
     * Additionally, the subscribers map is used to track the number of
     * active Logger instances for each filename. There should never be more
     * than 1
     * 
     * @private
     */
    private static instances: Map<string, Logger> = new Map()
    /**
     * A map of filename to Logger instance.
     *
     * Additionally, the subscribers map is used to track the number of
     * active Logger instances for each filename. There should never be more
     * than 1
     * 
     * @private
     */
    private static subscribers: Map<string, number> = new Map()
    
    get isActive() {
        return this.active;
      }
    /**
     * Get the subscriber count for a filename
     * @param filename The filename to get the count for
     * @returns The number of subscribers for this filename
     */
    private static getSubscriber(filename: string): number {
        return this.subscribers.get(filename) || 0
    }
    
    /**
     * Increment the subscriber count for a filename
     * @param filename The filename to increment the count for
     * @returns The new subscriber count
     */
    private static setSubscriber(filename: string): number {
        const currentCount = this.getSubscriber(filename)
        const newCount = currentCount + 1
        this.subscribers.set(filename, newCount)
        return newCount
    }
    
    /**
     * Get or create a Logger instance
     * @param filename - The filename to use as the log prefix
     * @param active - Whether or not to log messages `(default: true)`
     * 
     * **NOTE: `active` param**
     * 
     * If `active` is set to `false`, the logger will be disabled for this
     * filename. This means that {@link debug}, {@link info}, {@link success},
     * and {@link warn} will NOT log messages, regardless of {@link LogLevel}.
     * This helps to clean up boisterous logging.
     * 
     * {@link error} always logs messages, regardless of the {@link LogLevel} or `active` state
     * 
     * @returns A Logger instance
     */
    static instance(filename: string, active: boolean = true): Logger {
        const count = this.setSubscriber(filename)
        if (count === 1) {
            // Create a new logger instance
            this.instances.set(filename, new Logger(filename, active))
            if (active) console.log(colors.cyanBright(`¶ LOGGER ${filename}`))
        } else if (active !== this.instances.get(filename)!.active) {
            // Update active state if it changed
            this.instances.get(filename)!.active = active
            if (active) console.log(colors.cyanBright(`¶ LOGGER ${filename} [${count}] UPDATED`))
        }
        return this.instances.get(filename)!
    }
    
    private constructor(filename: string, active: boolean = true) {
        this.filename = filename
        this.active   = active
    }

    private dev     : boolean = process.env.NODE_ENV !== 'production'
    private filename: string
    private active  : boolean
    private logLevel: LogLevel = getLogLevel()
    
    private approved = (level: LogLevel) => {
        // If LOG_LEVEL is set, it takes precedence.
        // Otherwise, respect the 'active' flag and dev environment.
        return this.logLevel >= level || (this.active && this.dev)
    }

    /**
     * Format a log message with an optional error code
     */
    private formatMessage(errorCode?: ErrorCodeEnum): string {
        const codeStr = errorCode ? `[${errorCode}] ` : ''
        return `[${this.filename}] ${codeStr}`
    }

    debug(...args: any[]): void {
        if (!this.approved(LogLevel.DEBUG)) return
        console.log(`🔍 ${this.formatMessage()}`, ...args)
    }

    success(...args: any[]): void {
        if (!this.approved(LogLevel.SUCCESS)) return
        console.log(`✅ ${this.formatMessage()}`, ...args)
    }

    info(...args: any[]): void {
        if (!this.approved(LogLevel.INFO)) return
        console.log(`ℹ️ ${this.formatMessage()}`, ...args)
    }

    /**
     * Log an error message with optional error code
     * 
     * error ignores LogLevels and always logs messages.
     * Automatically sends errors to Sentry for monitoring.
     * 
     * @param args - Arguments to log (first argument can be an ErrorCode)
     */
    error(...args: any[]): void {
        // Check if the first argument is an ErrorCode
        let errorCode: ErrorCodeEnum | undefined
        if (args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('CD')) {
            errorCode = args[0] as ErrorCodeEnum
            args = args.slice(1) // Remove the error code from args
        }
        
        // If the first argument is an AppError, extract the code
        if (args.length > 0 && args[0] && typeof args[0] === 'object' && 'code' in args[0]) {
            errorCode = args[0].code
        }
        
        const formattedMessage = `❌ ${this.formatMessage(errorCode)}`
        console.error(formattedMessage, ...args)
        
        // Send to Sentry for monitoring (if available)
        // if (Sentry) {
        //     try {
        //         // Create error context for Sentry
        //         const errorContext = {
        //         logger: this.filename,
        //             errorCode,
        //             timestamp: new Date().toISOString(),
        //             args: args.map(arg => {
        //                 // Safely stringify objects for Sentry
        //                 if (typeof arg === 'object' && arg !== null) {
        //                     try {
        //                         return JSON.stringify(arg)
        //                     } catch {
        //                         return '[Object - could not stringify]'
        //                     }
        //                 }
        //                 return arg
        //             })
        //         }
                
        //         // If first arg is an Error object, capture it as an exception
        //         if (args.length > 0 && args[0] instanceof Error) {
        //             Sentry.withScope((scope: any) => {
        //                 scope.setTag('logger', this.filename)
        //                 scope.setContext('error_details', errorContext)
        //                 if (errorCode) {
        //                     scope.setTag('error_code', errorCode)
        //                 }
        //                 Sentry.captureException(args[0])
        //             })
        //         } else {
        //             // Capture as message with context
        //             Sentry.withScope((scope: any) => {
        //                 scope.setTag('logger', this.filename)
        //                 scope.setLevel('error')
        //                 scope.setContext('error_details', errorContext)
        //                 if (errorCode) {
        //                     scope.setTag('error_code', errorCode)
        //                 }
        //                 Sentry.captureMessage(formattedMessage)
        //             })
        //         }
        //     } catch (sentryError) {
        //         // Don't let Sentry errors break the application
        //         console.warn('Failed to send error to Sentry:', sentryError)
        //     }
        // }
    }

    /**
     * Log a warning message with optional error code
     * @param args - Arguments to log (first argument can be an ErrorCode)
     * @deprecated Use `warn` instead
     */
    warning(...args: any[]): void {
        return this.warn(...args)
    }

    /**
     * Log a warning message with optional error code
     * @param args - Arguments to log (first argument can be an ErrorCode)
     */
    warn(...args: any[]): void {
        if (!this.approved(LogLevel.WARN)) return
        
        // Check if the first argument is an ErrorCode
        let errorCode: ErrorCodeEnum | undefined
        if (args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('CD')) {
            errorCode = args[0] as ErrorCodeEnum
            args = args.slice(1) // Remove the error code from args
        }
        
        console.log(`⚠️ ${this.formatMessage(errorCode)}`, ...args)
    }

    /**
     * Log a message with a highlighted yellow background (DEBUG level)
     * @param args - Arguments to log
     */
    highlight(...args: any[]): void {
        if (!this.approved(LogLevel.DEBUG)) return
        console.log(colors.bgCyan(`🔔 ${this.formatMessage()}\n\t${JSON.stringify(args, null, 2)}`))
    }

    /**
     * Log a message as a reminder for engineers. This ignores LogLevels,
     * instead it only logs in STAGE or DEV environments.
     * @param args - Arguments to log
     */
    todo(...args: any[]): void {
        if (process.env.NODE_ENV === 'development') return
        return console.log(`📝 ${this.formatMessage()} TODO`, ...args)
    }
}