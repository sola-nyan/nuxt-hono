import { Hono } from 'hono'
import type { H3Event } from 'h3'

export function createH3HonoRouter() {
  return new Hono<{ Bindings: { event: H3Event } }>()
}
