import { Hono } from 'hono'

export const HonoRouter = new Hono()
  .post(
    // API PATH
    '/hono',
    // LOGIC
    async (c) => {
      return c.json(true)
    },
  )
  .post(
    // API PATH
    '/honoX',
    // LOGIC
    async (c) => {
      return c.json(false)
    },
  )
