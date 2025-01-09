import { defineEventHandler, toWebRequest } from 'h3'
import type { Hono } from 'hono'

export function createH3HonoHandler<T extends Hono>(app: T) {
  const handler = defineEventHandler(async (event) => {
    await app.fetch(toWebRequest(event), { event })
  })

  return handler
}
