import { useEffect, useRef } from 'react'

import { Logger } from '@peeps/utils'

type LoggedEffect = () => void | (() => void)

const DEFAULT_DEPS: ReadonlyArray<unknown> = []

type UseLoggedEffectByNameParams = {
  name  : string
  effect: LoggedEffect
  deps? : ReadonlyArray<unknown>
}

type UseLoggedEffectByLoggerParams = {
  logger: ReturnType<typeof Logger.instance>
  effect: LoggedEffect
  deps? : ReadonlyArray<unknown>
}

/**
 * Hook that logs when an effect is triggered using a name (creates a new logger)
 * @param name Name of the effect for logging
 * @param effect The effect function to run
 * @param deps Dependencies array for the effect
 */
export function useLoggedEffect(params: UseLoggedEffectByNameParams): void

/**
 * Hook that logs when an effect is triggered using a provided logger instance
 * @param logger Logger instance to use
 * @param effect The effect function to run
 * @param deps Dependencies array for the effect
 */
export function useLoggedEffect(params: UseLoggedEffectByLoggerParams): void

// Implementation
export function useLoggedEffect(params: UseLoggedEffectByNameParams | UseLoggedEffectByLoggerParams) {
  const loggerRef = useRef<ReturnType<typeof Logger.instance> | null>(null)
  if (!loggerRef.current) {
    loggerRef.current = 'name' in params ? Logger.instance(`${params.name}-useEffect`) : params.logger
  }

  const deps = params.deps ?? DEFAULT_DEPS
  const runCountRef = useRef(0)

  useEffect(() => {
    const runCount = runCountRef.current
    runCountRef.current = runCount + 1

    if ('name' in params) {
      loggerRef.current?.debug(`useLoggedEffect: ${params.name}: (${runCount})`)
    } else {
      loggerRef.current?.debug(`useLoggedEffect: (${runCount})`)
    }

    return params.effect()
  }, deps)
}