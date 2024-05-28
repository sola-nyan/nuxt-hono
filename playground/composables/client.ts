/* eslint-disable @typescript-eslint/no-explicit-any */
import { hc, type ClientRequest, type ClientResponse } from 'hono/client'
import type { Schema } from 'hono/types'
import type { AppType } from '~/server/api/[...]'

export const client = hc<AppType>('https://localhost:3000')
export async function useAPI<
    T extends ClientRequest<REQ>,
    REQ extends Schema = T extends ClientRequest<infer REQ> ? REQ : any,
    RES = T extends ClientResponse<infer RES> ? RES : any,
  >(routePick: (c: typeof client) => T, caller: (c: T) => RES) {
  const apiClient = await routePick(client)
  const res = await caller(apiClient)
  return res
}
