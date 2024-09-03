import { Hono } from 'hono'
import type { H3Event } from 'h3'

export function createHonoRouter(basePath: string) {
  const router = new Hono<{ Bindings: { event: H3Event } }>()
  if (basePath) router.basePath(basePath)
  return router
}
