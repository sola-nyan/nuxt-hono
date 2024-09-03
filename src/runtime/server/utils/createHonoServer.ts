import { Hono } from 'hono'
import type { H3Event } from 'h3'
import { defineEventHandler, getRequestProtocol, getRequestHost, readRawBody } from 'h3'

export function createHonoServer(customHandlers?: {
  unhandleErrorHandler?: (error: unknown) => void
}) {
  const app = new Hono<{ Bindings: { event: H3Event } }>()
  const requetCreator = HonoDefaultRequestCreator
  const unhandleErrorHandler = customHandlers?.unhandleErrorHandler

  const handler = defineEventHandler(async (event) => {
    try {
      const request = await requetCreator(event)
      return await app.fetch(request, { event })
    }
    catch (e) {
      if (unhandleErrorHandler)
        unhandleErrorHandler(e)
      else {
        console.log(e)
        throw e
      }
    }
  })

  return {
    handler,
    app,
  }
}

async function HonoDefaultRequestCreator(event: H3Event) {
  const PayloadMethods = ['PATCH', 'POST', 'PUT', 'DELETE']
  const protocol = getRequestProtocol(event)
  const domain = getRequestHost(event)
  const method = event.method
  const requestInfo: RequestInfo = `${protocol}://${domain}${event.path}`

  const requestInit: RequestInit = {
    method,
    headers: event.headers,
  }

  if (PayloadMethods.includes(method)) {
    const rawBody = await readRawBody(event)
    if (rawBody)
      requestInit.body = rawBody
  }

  return new Request(requestInfo, requestInit)
}
