<script setup>
import { RouterView } from "vue-router";
import { ref, reactive, onMounted, onBeforeMount } from "vue";

import { createDB } from "./hooks/useDB";

import { useBookStore } from "./stores/books";
import { storeToRefs } from "pinia";

let useBook = useBookStore();
let { updateDbInstance } = useBook;

let DBObj = reactive({});
console.info('app: setup内')

onBeforeMount(async () => {
  console.info('app: onBeforeMount开始')
  let db = createDB("test", [{
    name: "basic-info",
    schema: "++id, currentBook",
  }]);
  DBObj = reactive(db);
  console.log(DBObj);
  updateDbInstance(DBObj);
  console.info('app: onBeforeMount结束')
});

let infod = ref();

function desc(info) {
  infod.value = info;
}
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
