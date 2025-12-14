/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRequestHeaders } from '#app'
import type { Hono } from 'hono'
import { hc } from 'hono/client'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function jsonMethodOverride(obj: any): Response {
  obj.json = async function () {
    return obj._data
  }
  return obj
}

async function safeFetch(
  url: string,
  init: RequestInit | undefined,
  headers: HeadersInit | undefined,
): Promise<Response> {
  try {
    const res = await $fetch.raw(url, { ...(init || {}), headers } as any)
    return jsonMethodOverride(res)
  }
  catch (e: any) {
    const res = jsonMethodOverride(await e.response)
    return res
  }
}

function parseUrl(input: RequestInfo | URL) {
  return input instanceof URL
    ? input.toString()
    : typeof input === 'string'
      ? input
      : input.url
}

function parseHeadersForSSR(init: RequestInit | undefined) {
  let headers: HeadersInit | undefined = init?.headers
  const reqHeaders = useRequestHeaders(['cookie'])
  if (reqHeaders) {
    if (reqHeaders.cookie) {
      const h = new Headers(headers ?? {})
      if (!h.has('cookie'))
        h.set('cookie', reqHeaders.cookie)
      headers = h
    }
  }
  return headers
}

export function createH3HonoClient<AppType extends Hono>(
  baseUrl: string, options?: {
    preHandler?: (url: string, init: RequestInit | undefined) => void
    postHandler?: (res: Response) => void
  }) {
  const NitroCustomRequestFetcher: FetchLike = async (input, init) => {
    const url = parseUrl(input)
    const headers = parseHeadersForSSR(init)
    if (options?.preHandler) await options?.preHandler(url, init)
    const res = await safeFetch(url, init, headers)
    if (options?.postHandler) await options?.postHandler(res)
    return res
  }

  return hc<AppType>(baseUrl, {
    fetch: NitroCustomRequestFetcher,
  })
}
