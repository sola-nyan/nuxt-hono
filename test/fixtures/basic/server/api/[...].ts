import { createHonoServer } from '../../../../../src/runtime/server/utils/createHonoServer'
import { HonoRouter } from '../hono/HonoRouter'

const { handler, app } = createHonoServer({ basePath: '/api' })
const routes
  = app
    .route('/', HonoRouter)

export type AppType = typeof routes
export default handler
