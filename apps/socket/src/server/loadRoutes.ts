import type { Express, Router } from 'express'
import { Logger } from '@peeps/utils'
import { promises as fs } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const ROUTE_FILENAME_REGEX = /^(.*\.)?route\.(ts|js)$/i
const logger               = Logger.instance('RouteLoader', false)

type RouteModule = {
  default?: Router
  router?: Router
}

export async function loadRoutes(app: Express, routesDir: string): Promise<number> {
  logger.debug('routes.dir', { routesDir })
  const routeFiles = await discoverRouteFiles(routesDir)
  let count = 0

  for (const filePath of routeFiles) {
    try {
      const routePath = buildRoutePath(filePath, routesDir)
      const module    = (await import(pathToFileURL(filePath).href)) as RouteModule
      const router    = module.default ?? module.router

      if (!router) {
        logger.warn('route.missingRouter', { filePath })
        continue
      }

      app.use(routePath, router)
      const handlers = getRouterMethods(router)
      logger.debug('route.registered', { route: routePath, handlers })
      count++
    } catch (error) {
      logger.error('route.loadFailed', { filePath, error })
    }
  }

  logger.debug('routes.loaded', { count })
  return count
}

async function discoverRouteFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...await discoverRouteFiles(entryPath))
      } else if (ROUTE_FILENAME_REGEX.test(entry.name)) {
        files.push(entryPath)
      }
    }

    return files
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.warn('routes.directoryMissing', { dir })
      return []
    }

    throw error
  }
}

function buildRoutePath(filePath: string, routesDir: string): string {
  const relative = path.relative(routesDir, filePath).replace(/\\/g, '/')
  const dir = path.dirname(relative)
  const route = dir === '.' ? '' : dir
  return `/${route}`.replace(/\/+/g, '/') || '/'
}

function getRouterMethods(router: Router): string[] {
  try {
    const stack = (router as any).stack ?? []
    const methods = new Set<string>()

    for (const layer of stack) {
      const route = layer?.route
      if (!route) continue

      for (const [method, enabled] of Object.entries(route.methods ?? {})) {
        if (enabled) methods.add(method.toUpperCase())
      }
    }

    return Array.from(methods).sort()
  } catch (error) {
    logger.warn('route.handlers.inspect_failed', { error })
    return []
  }
}
