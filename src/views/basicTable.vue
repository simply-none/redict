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

import { delBFromA, filterBFromA } from "../utils/common";

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let couldDataLen = ref(0);

let loading = ref(true);

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

watch(
  [bookData, rangeData],
  ([nBookData, nRangeData], [oBookData, oRangeData]) => {
    if (!nBookData || !nRangeData || !nBookData.length || !nRangeData.length) {
      return false;
    }

    loading.value = true;

    let couldData = filterBFromA(rangeData.value, bookData.value);
    couldDataLen.value = couldData.length;

    rangeNotInBookData.value = delBFromA(rangeData.value, bookData.value);
    rangeNotInBookData.value = rangeNotInBookData.value.map((w) => ({ n: w }));

    loading.value = false;
  }
);

async function getBookTable() {
  let bookTable = getTable(basicData.value.currentBook);
  bookTable.toArray().then((d) => {
    bookData.value = d.map((w) => w.n.toLowerCase());
    bookData.value = Array.from(new Set(bookData.value));
  });
}

async function getRangeTable() {
  let rangeTable = getTable(basicData.value.currentRange);
  rangeTable.toArray().then((d) => {
    rangeData.value = d.map((w) => w.n.toLowerCase());
    rangeData.value = Array.from(new Set(rangeData.value));
  });
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
