import { Hono } from 'hono'
import { defineEventHandler } from 'h3'
import HonoDefaultRequestCreator from './HonoDefaultRequestCreator'

interface Customhandlers {
  requestCreator: (event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) => Promise<Request>
  unhandleErrorHandler: (error: unknown) => void
}

export default function createHonoServer(customHandlers?: Customhandlers) {
  const app = new Hono<{ Bindings: { event: Parameters<Parameters<typeof defineEventHandler>[0]>[0] } }>()
  const requetCreator = customHandlers?.requestCreator ?? HonoDefaultRequestCreator
  const unhandleErrorHandler = customHandlers?.unhandleErrorHandler

  const handler = defineEventHandler(async (event) => {
    try {
      const request = await requetCreator(event)
      return await app.fetch(request, { event })
    }
    catch (e) {
      if (unhandleErrorHandler)
        unhandleErrorHandler(e)
      else {
        throw e
      }
    }
  })

  return {
    handler,
    app,
  }
}
