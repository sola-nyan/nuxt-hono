export const HonoRouter = createHonoRouter()
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
      return c.json(c.env.event.path)
    },
  )
