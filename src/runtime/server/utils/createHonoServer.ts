import { Hono } from 'hono'
import { defineEventHandler } from 'h3'
import HonoDefaultRequestCreator from './HonoDefaultRequestCreator'
import type { Customhandlers, H3Event } from '~/src/type'

export default function createHonoServer(customHandlers?: Customhandlers) {
  const app = new Hono<{ Bindings: { event: H3Event } }>()
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
