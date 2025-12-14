import { Hono } from 'hono'
import { router as route_0 } from '~~/server/hono/routers/hono/HonoRouter'
import { router as route_1 } from '~~/server/hono/routers/IndexRouter'

const app = new Hono()
  .route('/hono', route_0)
  .route('/', route_1)
export default app
