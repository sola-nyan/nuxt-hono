<!-- eslint-disable no-console -->
<script setup lang="ts">
import { hc } from 'hono/client'
import type { AppType } from './server/api/[...]'

const client = hc<AppType>('http://localhost:3000')
const useAPI = honoClientWrapper(client, {
  preRequest: (data) => {
    console.log(data)
  },
  async postResponse({ isJson, res }) {
    if (isJson)
      console.log(await res.json())
  },
})

async function callHono() {
  const res = await useAPI(c => c.api.hono.$post())
  console.log(res)
}

async function callHonoX() {
  const res = await useAPI(c => c.api.honoX.$post({
    json: {
      test: 'A',
    },
  }))
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
