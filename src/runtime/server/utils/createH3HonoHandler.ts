import { defineEventHandler, toWebRequest } from 'h3'
import type { Hono } from 'hono'

export function createH3HonoHandler<T extends Hono>(app: T, proxyHandler = defineEventHandler) {
  const handler = proxyHandler(async (event) => {
    return await app.fetch(toWebRequest(event), { event })
  })

  return handler
}
