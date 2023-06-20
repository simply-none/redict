<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue'

let infod = ref()

function desc (info) {
  infod.value = info
}
</script>

<template>
  <RouterView/>
</template>

<style scoped>


</style>
