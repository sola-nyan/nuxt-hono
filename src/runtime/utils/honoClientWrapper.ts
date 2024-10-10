import type { ClientResponse } from 'hono/client'
import type { ResponseFormat } from 'hono/types'
import type { StatusCode } from 'hono/utils/http-status'

export function honoClientWrapper<C>(hcClient: C) {
  async function internalCaller<
    T extends Promise<ClientResponse<X, Y, ResponseFormat>>,
    X,
    Y extends StatusCode,
  >(caller: (client: typeof hcClient) => T): Promise<Awaited<T>> {
    return await caller(hcClient)
  }

  return internalCaller
}
