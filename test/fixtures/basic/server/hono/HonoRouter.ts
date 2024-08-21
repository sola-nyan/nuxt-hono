import { createHonoRouter } from '../../../../../src/runtime/server/utils/createHonoRouter'

export const HonoRouter = createHonoRouter()
  .post(
    // API PATH
    '/hono',
    async (c) => {
      const res = c.text('get')
      console.log(res)
      return res
    },
  )
  .post(
    // API PATH
    '/honoX',
    // LOGIC
    async (c) => {
      return c.text(await c.req.json()['text'])
    },
  )
