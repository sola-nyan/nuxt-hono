import type { ClientResponse } from 'hono/client'
import type { ResponseFormat } from 'hono/types'
import type { StatusCode } from 'hono/utils/http-status'

export function wrapHonoClinet<C>(hcClient: C) {
  async function internalCaller<
    T extends Promise<ClientResponse<X, Y, ResponseFormat>>,
    X,
    Y extends StatusCode,
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
