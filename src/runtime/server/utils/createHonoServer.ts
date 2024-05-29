import { Hono } from 'hono'
import { defineEventHandler, getRequestProtocol, getRequestHost, readRawBody } from 'h3'

export function createHonoServer(customHandlers?: {
  requestCreator: (event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) => Promise<Request>
  unhandleErrorHandler: (error: unknown) => void
}) {
  const app = new Hono<{ Bindings: { event: Parameters<Parameters<typeof defineEventHandler>[0]>[0] } }>()
  const requetCreator = customHandlers?.requestCreator ?? HonoDefaultRequestCreator
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

async function HonoDefaultRequestCreator(event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
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
