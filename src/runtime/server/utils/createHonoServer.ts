import { Hono } from 'hono'
import type { H3Event } from 'h3'
import { defineEventHandler, getRequestProtocol, getRequestHost, readRawBody } from 'h3'

export interface Customhandlers {
  requestCreator: (event: H3Event) => Promise<Request>
  unhandleErrorHandler: (error: unknown) => void
}

export async function DefaultRequestCreator(event: H3Event) {
  const PayloadMethods = ['PATCH', 'POST', 'PUT', 'DELETE']
  const protocol = getRequestProtocol(event)
  const domain = getRequestHost(event)
  const method = event.method
  const requestInfo: RequestInfo = `${protocol}://${domain}${event.path}`

  const requestInit: RequestInit = {
    method,
    headers: event._headers,
  }

  if (PayloadMethods.includes(method)) {
    const rawBody = await readRawBody(event)
    if (rawBody)
      requestInit.body = rawBody
  }

  return new Request(requestInfo, requestInit)
}

export default function (customHandlers?: Customhandlers) {
  const app = new Hono<{ Bindings: { event: H3Event } }>()
  const requetCreator = customHandlers?.requestCreator ?? DefaultRequestCreator
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
        throw e
      }
    }
  })

  return {
    handler,
    app,
  }
}
