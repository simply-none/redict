<!-- 展示当日完成的单词列表 -->
<template>
  <el-descriptions :column="1" border>
    <el-descriptions-item label="当前词典">{{
      basicData.currentBook
    }}</el-descriptions-item>
    <el-descriptions-item label="词典词汇量">{{
      dictWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item label="单词本">{{
      basicData.currentRange
    }}</el-descriptions-item>
    <el-descriptions-item label="单词个数">{{
      bookWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item :label="basicData.studyMode + '模式下能够学习的单词'">{{
      willStudyWords?.length
    }}</el-descriptions-item>
    <el-descriptions-item label="不在词典中的单词个数">{{
      notStudyWords?.length
    }}</el-descriptions-item>
  </el-descriptions>
</template>
<script setup>
import { storeToRefs } from "pinia";

import { useBookStore } from "../../stores/books";
import { useWordStore } from "../../stores/words";

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
