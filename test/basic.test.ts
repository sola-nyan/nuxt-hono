import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('basic fetch', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>get</div>')
    expect(html).toContain('<div>post</div>')
  })
})
