/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineEventHandler, toWebRequest } from 'h3'
import type { Hono } from 'hono'

export function createH3HonoHandler<APP extends Hono<any, any, any>>(app: APP, proxyHandler = defineEventHandler) {
  const handler = proxyHandler(async (event) => {
    return await app.fetch(toWebRequest(event), { event })
  })
  return handler
}
