import type { H3Event } from 'h3'
import { defineEventHandler, toWebRequest } from 'h3'
import type { Hono } from 'hono'

type ROUTER = Hono<{ Bindings: { event: H3Event } }>
export function createH3HonoHandler<APP extends ROUTER>(app: APP, proxyHandler = defineEventHandler) {
  const handler = proxyHandler(async (event) => {
    return await app.fetch(toWebRequest(event), { event })
  })

  return handler
}
