import { logger } from 'hono/logger'
import generatedRouter from '../hono/generated/generatedRoutes'

const app = createH3HonoApp()
  .basePath('/api')
  .use(logger())
  .route('/', generatedRouter)

export type AppType = typeof app

export default createH3HonoHandler(app)
