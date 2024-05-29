import type { defineEventHandler } from 'h3'
import { getRequestProtocol, getRequestHost, readRawBody } from 'h3'

export default async function (event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
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
