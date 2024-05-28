<!-- eslint-disable no-console -->
<script setup lang="ts">
const form = reactive({
  username: '',
  password: '',
  code: '',
})
</script>

<template>
  <div class="p-3 [&>*]:m-2">
    <div>
      <div>Server Auth</div>
      <div>
        <input
          v-model="form.username"
          type="text"
        >
        <input
          v-model="form.password"
          type="text"
        >
        <input
          v-model="form.code"
          type="text"
        >
      </div>
      <input
        type="button"
        value="Public API"
      >
      <input
        type="button"
        value="Protected API"
      >
    </div>
  </div>
  <NuxtPage />
</template>
