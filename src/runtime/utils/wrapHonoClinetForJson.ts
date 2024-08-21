import type { ClientResponse } from 'hono/client'

type AwaitableType<T> = T | PromiseLike<T>
type HCJsonBody<T> = T extends ClientResponse<infer X, number, 'json'> ? X : unknown

export function wrapHonoClinetForJson<C>(hcClient: C) {
  async function internalCaller<
    T extends Promise<ClientResponse<X, Y, 'json'>>, X, Y extends number,
  >(
    caller: (client: typeof hcClient) => T): Promise<HCJsonBody<T>> {
    const res = caller(hcClient)
    const parsed = await hcJson(res)

    return parsed as HCJsonBody<T>
  }

  return internalCaller
}

async function hcJson<
  T extends Promise<ClientResponse<X, Y, 'json'>>, X, Y extends number,
>(fetchRes: AwaitableType<T>): Promise<X> {
  const res = await fetchRes
  const data = await res.json()
  return data as Awaited<X>
}
