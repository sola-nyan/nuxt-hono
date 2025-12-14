import { logger } from 'hono/logger'
import { Hono } from 'hono'
import generatedRouter from '../hono/generated/generatedRoutes'

const app = new Hono()
  .basePath('/api')
  .use(logger())
  .route('/', generatedRouter)

export type AppType = typeof app

export default createH3HonoHandler(app)
