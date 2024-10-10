import type { ClientResponse } from 'hono/client'
import type { ResponseFormat } from 'hono/types'
import type { StatusCode } from 'hono/utils/http-status'

export function honoClientWrapper<C>(hcClient: C) {
  async function internalCaller<T extends Promise<ClientResponse<X, Y, ResponseFormat>>, X, Y extends StatusCode>(caller: (client: typeof hcClient) => T): Promise<{
    ok: boolean
    status: Y
    body: ReturnType<typeof $raw['json']>
    $raw: Awaited<T>
  }> {
    const $raw = await caller(hcClient)
    const body = await $raw.json() as ReturnType<typeof $raw['json']>
    return {
      ok: $raw.ok,
      status: $raw.status,
      body,
      $raw,
    }
  }

  return internalCaller
}
