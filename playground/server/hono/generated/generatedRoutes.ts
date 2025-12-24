import { router as route_0 } from '~~/server/hono/routers/foo/bar/FooBarRouter'
import { router as route_1 } from '~~/server/hono/routers/foo/bar/FooBarTestRouter'
import { router as route_2 } from '~~/server/hono/routers/hono/HonoRouter'
import { router as route_3 } from '~~/server/hono/routers/IndexRouter'

const app = createH3HonoRouter()
  .route('/foo/bar', route_0)
  .route('/foo/bar/test', route_1)
  .route('/hono', route_2)
  .route('/', route_3)
export default app
