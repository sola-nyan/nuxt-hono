import { logger } from 'hono/logger'
import { HonoRouter } from '../hono/routers/HonoRouter'

const { handler, app } = createHonoServer()
const routes
  = app
    .basePath('/api')
    .use(logger())
    .route('/', HonoRouter)

export type AppType = typeof routes
export default handler
