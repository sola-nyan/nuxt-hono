<!-- eslint-disable no-console -->
<script setup lang="ts">
import type { AppType } from './server/api/[...]'

const client = createH3HonoClient<AppType>('http://localhost:3000', {
  preHandler: (url) => {
    console.log(`[pre] url: ${url}`)
  },
  postHandler: (res) => {
    console.log(`[post] ok: ${res.ok}`)
  },

})

async function callHono() {
  const res = await client.api.hono.$post()
  console.log(res)
}

async function callHonoX() {
  const res = await client.api.honoX.$post({
    json: {
      test: 'A',
    },
  })
  console.log(res)
}
</script>

<template>
  <div class="p-3 [&>*]:m-2">
    <div>
      <div>Api Call</div>
      <input
        type="button"
        value="Hono API"
        @click="callHono"
      >
      <input
        type="button"
        value="HonoX API"
        @click="callHonoX"
      >
    </div>
  </div>
  <NuxtPage />
</template>
