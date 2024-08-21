<script setup>
const honoGet = $fetch('/api/hono', { method: 'GET', params: { text: 'get' } })
const honoPost = $fetch('/api/honoX', { method: 'POST', body: { text: 'post' } })
</script>

<template>
  <div>{{ honoGet }}</div>
  <div>{{ honoPost }}</div>
</template>
