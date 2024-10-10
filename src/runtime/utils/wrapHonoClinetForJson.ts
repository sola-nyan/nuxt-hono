import type { ClientResponse } from 'hono/client'
import type { ResponseFormat } from 'hono/types'

export function wrapHonoClinetForJson<C>(hcClient: C) {
  async function internalCaller<
    T extends Promise<ClientResponse<X, Y, ResponseFormat>>,
    X,
    Y extends number,
  >(
    caller: (client: typeof hcClient) => T,
  ) {
    const $raw = await caller(hcClient)
    const body = await $raw.json() as Awaited<ReturnType<typeof $raw['json']>>
    return {
      body,
      $raw,
    }
  }

  return internalCaller
}
