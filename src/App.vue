<script setup>
import { RouterView } from "vue-router";
import { ref, reactive, onMounted } from "vue";

import { createDB } from "./hooks/database";

import { useBookStore } from "./stores/books";
import { storeToRefs } from "pinia";

let useBook = useBookStore();
let { updateDbInstance } = useBook;

let DBObj = reactive({});

onMounted(async () => {
  let db = await createDB("test", {
    name: "basic-info",
    schema: "++id, currentBook",
  });
  DBObj = reactive(db);
  console.log(DBObj);
  await updateDbInstance(DBObj);
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
