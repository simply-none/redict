<!-- 展示当日完成的单词列表 -->
<template>
  <el-descriptions title="基础数据览表" :column="1" border>
    <el-descriptions-item label="选择书本">{{
      currentBook
    }}</el-descriptions-item>
    <el-descriptions-item label="书本词汇">{{
      bookData.length
    }}</el-descriptions-item>
    <el-descriptions-item label="选择范围">{{
      currentRange
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

  <h3 class="today-voca-head">
    {{ todayDate }}背诵单词，共计：{{ vocalist.length }}个
  </h3>
  <el-table :data="vocalist" max-height="250" style="width: 100%" border stripe>
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="n" label="单词" sortable />
    <el-table-column prop="count" label="次数" sortable />
  </el-table>

  <h3 class="today-voca-head">
    历史背诵单词，共计：{{ historyVocalist.length }}个
  </h3>
  <el-table
    :data="historyVocalist"
    max-height="250"
    style="width: 100%"
    border
    stripe
  >
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="n" label="单词" sortable />
    <el-table-column prop="count" label="次数" sortable />
    <el-table-column prop="date" label="日期" sortable />
  </el-table>

  <h3 class="today-voca-head">
    非范围单词，共计：{{ rangeNotInBookData.length }}个
  </h3>
  <el-table
    :data="rangeNotInBookData"
    max-height="250"
    style="width: 100%"
    border
    stripe
  >
    <el-table-column prop="index" label="序号" width="180">
      <template #default="scope">
        {{ scope.$index + 1 }}
      </template>
    </el-table-column>
    <el-table-column prop="n" label="单词" sortable />
  </el-table>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import moment from "moment";

let todayDate = ref(moment().format("YYYY年M月D日"));

let useBook = useBookStore();

let { dbInstance, currentBook, currentRange } = storeToRefs(useBook);

let todayTable = dbInstance.value.getTable("today-studied-voca");
let historyTable = dbInstance.value.getTable("studied-voca");

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([])

let couldDataLen = ref(0)

getVocaList();

getHistoryVocaList();

getBookRangeData();

async function getBookRangeData() {
  let bookTable = await dbInstance.value.getTable(currentBook.value);
  let rangeTable = await dbInstance.value.getTable(currentRange.value);

  bookData.value = await bookTable.toArray();
  rangeData.value = await rangeTable.toArray();

  console.log(rangeData.value[0])

  let tempRange = bookData.value.map(w => w.n.toLowerCase())
  tempRange = rangeData.value.filter(w => tempRange.includes(w.n.toLowerCase())).map(w => w.n.toLowerCase())
  console.log(tempRange[0])
  rangeNotInBookData.value = rangeData.value.filter(w => !tempRange.includes(w.n.toLowerCase()))
  couldDataLen.value = tempRange.length
}

async function getVocaList() {
  vocalist.value = await todayTable.toArray();
}

async function getHistoryVocaList() {
  historyVocalist.value = await historyTable.toArray();
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
