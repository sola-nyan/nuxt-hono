import { logger } from 'hono/logger'
import { Hono } from 'hono'
import { HonoRouter } from '../hono/routers/HonoRouter'

const app = new Hono()
  .basePath('/api')
  .use(logger())
  .route('/', HonoRouter)

export type AppType = typeof app

export default createH3HonoHandler(app)
