import type { Hono } from 'hono'
import { hc, type ClientResponse } from 'hono/client'

type AwaitableType<T> = T | PromiseLike<T>
type HCJsonBody<T> = T extends Promise<ClientResponse<infer X, number, 'json'>> ? X : unknown

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHonoJsonClient<AppType extends Hono<any, any, any>>(baseUrl = '/', options?: Parameters<typeof hc>[1]) {
  const iClient = hc<AppType>(baseUrl, options)

  async function internalCaller<
  T extends Promise<ClientResponse<X, Y, 'json'>>, X, Y extends number,
>(
    caller: (client: typeof iClient) => T): Promise<Awaited<HCJsonBody<T>>> {
    const res = caller(iClient)
    const parsed = await hcJson(res)

    return parsed as Awaited<HCJsonBody<T>>
  }

  return internalCaller
}

async function hcJson<
  T extends Promise<ClientResponse<X, Y, 'json'>>, X, Y extends number,
>(fetchRes: AwaitableType<T>): Promise<Awaited<X>> {
  const res = await fetchRes
  const data = await res.json()
  return data as Awaited<X>
}
