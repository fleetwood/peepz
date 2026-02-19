export declare enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    SUCCESS = 4,
    DEBUG = 5
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
export declare class Logger {
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
    private static instances;
    /**
     * A map of filename to Logger instance.
     *
     * Additionally, the subscribers map is used to track the number of
     * active Logger instances for each filename. There should never be more
     * than 1
     *
     * @private
     */
    private static subscribers;
    get isActive(): boolean;
    /**
     * Get the subscriber count for a filename
     * @param filename The filename to get the count for
     * @returns The number of subscribers for this filename
     */
    private static getSubscriber;
    /**
     * Increment the subscriber count for a filename
     * @param filename The filename to increment the count for
     * @returns The new subscriber count
     */
    private static setSubscriber;
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
    static instance(filename: string, active?: boolean): Logger;
    private constructor();
    private dev;
    private filename;
    private active;
    private logLevel;
    private approved;
    /**
     * Format a log message with an optional error code
     */
    private formatMessage;
    debug(...args: any[]): void;
    success(...args: any[]): void;
    info(...args: any[]): void;
    /**
     * Log an error message with optional error code
     *
     * error ignores LogLevels and always logs messages.
     * Automatically sends errors to Sentry for monitoring.
     *
     * @param args - Arguments to log (first argument can be an ErrorCode)
     */
    error(...args: any[]): void;
    /**
     * Log a warning message with optional error code
     * @param args - Arguments to log (first argument can be an ErrorCode)
     * @deprecated Use `warn` instead
     */
    warning(...args: any[]): void;
    /**
     * Log a warning message with optional error code
     * @param args - Arguments to log (first argument can be an ErrorCode)
     */
    warn(...args: any[]): void;
    /**
     * Log a message with a highlighted yellow background (DEBUG level)
     * @param args - Arguments to log
     */
    highlight(...args: any[]): void;
    /**
     * Log a message as a reminder for engineers. This ignores LogLevels,
     * instead it only logs in STAGE or DEV environments.
     * @param args - Arguments to log
     */
    todo(...args: any[]): void;
}
//# sourceMappingURL=logger.d.ts.map