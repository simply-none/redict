<!-- 展示当日完成的单词列表 -->
<template>
  <el-descriptions :column="1" border v-loading="loading">
    <el-descriptions-item label="选择书本">{{
      basicData.currentBook
    }}</el-descriptions-item>
    <el-descriptions-item label="书本词汇">{{
      bookData.length
    }}</el-descriptions-item>
    <el-descriptions-item label="选择范围">{{
      basicData.currentRange
    }}</el-descriptions-item>
    <el-descriptions-item label="范围词汇">{{
      rangeData.length
    }}</el-descriptions-item>
    <el-descriptions-item label="范围可用词汇">{{
      couldDataLen
    }}</el-descriptions-item>
    <el-descriptions-item label="范围不可用词汇">{{
      rangeNotInBookData.length
    }}</el-descriptions-item>
  </el-descriptions>
</template>
<script setup>
import { ref, reactive, onMounted, watch, toRaw } from "vue";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import Worker from "../utils/getStoreWebWork.js?worker";

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let couldDataLen = ref(0);

let loading = ref(true)

let worker = new Worker()

worker.addEventListener('message', (e) => {
  let data = JSON.parse(e.data)
  rangeNotInBookData.value = data.rangeNotInBookData
  couldDataLen.value = data.couldDataLen
  loading.value = false
})

watch(
  basicData,
  () => {
    getBookRangeData();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  getBookRangeData();
});

watch([bookData, rangeData], ([nBookData, nRangeData], [oBookData, oRangeData]) => {
  if (!nBookData || !nRangeData || !nBookData.length || !nRangeData.length) {
    return false
  }

  loading.value = true
  worker.postMessage({nBookData: toRaw(nBookData), nRangeData: toRaw(nRangeData)})
})

async function getBookTable () {
  let bookTable = getTable(basicData.value.currentBook);
  bookTable.toArray().then((d) => {
    bookData.value = d
  })
}

async function getRangeTable () {
  let rangeTable = getTable(basicData.value.currentRange);
  rangeTable.toArray().then((d) => {
    rangeData.value = d
  })
}

async function getBookRangeData() {
  if (!basicData.value.currentBook || !basicData.value.currentRange) {
    return false;
  }

  getBookTable();
  getRangeTable();
}
</script>
<style lang="scss" scoped>
.today-voca {
  &-head {
    padding: 1em 0;
    font-weight: 600;
    color: #666;
  }
}
</style>
