import { Hono } from 'hono'
import type { H3Event } from 'h3'
import { defineEventHandler, getRequestProtocol, getRequestHost, readRawBody } from 'h3'
import type { ErrorHandler, NotFoundHandler } from 'hono'

interface ExtendedEnv { Bindings: { event: H3Event } }

export function createHonoServer(option?: {
  unhandleErrorHandler?: ErrorHandler<ExtendedEnv>
  notFountHandler?: NotFoundHandler<ExtendedEnv>
}) {
  const app = new Hono<ExtendedEnv>()

  if (option?.unhandleErrorHandler) {
    app.onError(option.unhandleErrorHandler)
  }

  if (option?.notFountHandler) {
    app.notFound(option.notFountHandler)
  }

  const requetCreator = HonoDefaultRequestCreator

  const handler = defineEventHandler(async (event) => {
    const request = await requetCreator(event)
    return await app.fetch(request, { event })
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
