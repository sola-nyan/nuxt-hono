import type { H3Event } from 'h3'
import { defineEventHandler, toWebRequest } from 'h3'
import type { Hono } from 'hono'

export function createH3HonoHandler<APP extends Hono<{ Bindings: { event: H3Event } }>>(app: APP, proxyHandler = defineEventHandler) {
  const handler = proxyHandler(async (event) => {
    return await app.fetch(toWebRequest(event), { event })
  })

  return handler
}
