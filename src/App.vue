<script setup>
import { RouterView } from "vue-router";
import { ref, reactive, onMounted, onBeforeMount } from "vue";

import useDBStore from './stores/db'

let useDB = useDBStore()
let { createDB } = useDB

onBeforeMount(async () => {
  createDB("test", [{
    name: "basic-info",
    schema: "++id, currentBook",
  }]);
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
