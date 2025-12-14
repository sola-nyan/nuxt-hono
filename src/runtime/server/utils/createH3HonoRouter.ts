import { Hono } from 'hono'
import type { H3Event } from 'h3'
import type { BlankSchema } from 'hono/types'

export function createH3HonoRouter(): Hono<{
  Bindings: {
    event: H3Event
  }
}, BlankSchema, '/'> {
  return new Hono<{ Bindings: { event: H3Event } }>()
}
