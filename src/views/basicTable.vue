<!-- 展示当日完成的单词列表 -->
<template>
  <el-descriptions :column="1" border>
    <el-descriptions-item label="选择书本">{{
      basicData.currentBook
    }}</el-descriptions-item>
    <el-descriptions-item label="书本词汇">{{
      dictWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item label="选择范围">{{
      basicData.currentRange
    }}</el-descriptions-item>
    <el-descriptions-item label="范围词汇">{{
      bookWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item label="范围可用词汇">{{
      willStudyWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item label="范围不可用词汇">{{
      notStudyWords?.length
    }}</el-descriptions-item>
  </el-descriptions>
</template>
<script setup>

import { useBookStore } from "../stores/books";
import { useWordStore } from "../stores/words";
import { storeToRefs } from "pinia";

let useBook = useBookStore();
let useWord = useWordStore();

let { basicData } = storeToRefs(useBook);
let {
  bookWords,
  dictWords,
  willStudyWords,
  notStudyWords,
} = storeToRefs(useWord);

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
