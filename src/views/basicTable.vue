<!-- 展示当日完成的单词列表 -->
<template>
  <el-descriptions :column="1" border>
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
import { ref, reactive, onMounted, watch } from "vue";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let couldDataLen = ref(0);

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

async function getBookRangeData() {
  if (!basicData.value.currentBook || !basicData.value.currentRange) {
    return false;
  }
  let bookTable = await getTable(basicData.value.currentBook);
  let rangeTable = await getTable(basicData.value.currentRange);
  

  bookData.value = await bookTable.toArray();
  rangeData.value = await rangeTable.toArray();

  

  let tempRange = bookData.value.map((w) => w.n.toLowerCase());
  tempRange = rangeData.value
    .filter((w) => tempRange.includes(w.n.toLowerCase()))
    .map((w) => w.n.toLowerCase());
  
  rangeNotInBookData.value = rangeData.value.filter(
    (w) => !tempRange.includes(w.n.toLowerCase())
  );
  couldDataLen.value = tempRange.length;
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
