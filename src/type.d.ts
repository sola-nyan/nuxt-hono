import type { H3Event } from 'h3'

export interface Customhandlers {
  requestCreator: (event: H3Event) => Promise<Request>
  unhandleErrorHandler: (error: unknown) => void
}

export type H3Event = H3Event
