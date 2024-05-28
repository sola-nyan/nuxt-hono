<!-- eslint-disable no-console -->
<script setup lang="ts">
async function callHono() {
  const res = await client.api.hono.$post()
  console.log(res)
}

async function callHonoX() {
  const res = await client.api.honoX.$post()
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
