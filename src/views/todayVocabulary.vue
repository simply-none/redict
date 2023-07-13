<!-- 展示当日完成的单词列表 -->
<template>
  <h3 class="today-voca-head">
    今日（{{ todayDate }}）背诵单词，共计：{{ vocalist.length }}个
    <el-link @click="lookTodayVocaMore">查看更多...</el-link>
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
import { ref, reactive, onMounted, watch } from "vue";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import { useRoute, useRouter } from "vue-router";

import moment from "moment";

let todayDate = ref(moment().format("YYYY-MM-DD"));

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable, schema } = useDB;
console.log(
  JSON.parse(JSON.stringify(schema)),
  basicData.value.currentBook,
  basicData.value.currentRange
);

let todayTable = getTable("today-studied-voca");
let historyTable = getTable("studied-voca");

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let couldDataLen = ref(0);

let router = useRouter();

watch(
  basicData,
  () => {
    getVocaList();
    getHistoryVocaList();
    getBookRangeData();
  },
  {
    deep: true,
    immediate: true,
  }
);

function lookTodayVocaMore() {
  router.push({
    name: "lookTodayVoca",
  });
}

async function getBookRangeData() {
  if (!basicData.value.currentBook || !basicData.value.currentRange) {
    return false;
  }
  let bookTable = await getTable(basicData.value.currentBook);
  let rangeTable = await getTable(basicData.value.currentRange);
  console.log(bookTable, rangeTable);

  bookData.value = await bookTable.toArray();
  rangeData.value = await rangeTable.toArray();

  console.log(rangeData.value[0]);

  let tempRange = bookData.value.map((w) => w.n.toLowerCase());
  tempRange = rangeData.value
    .filter((w) => tempRange.includes(w.n.toLowerCase()))
    .map((w) => w.n.toLowerCase());
  console.log(tempRange[0]);
  rangeNotInBookData.value = rangeData.value.filter(
    (w) => !tempRange.includes(w.n.toLowerCase())
  );
  couldDataLen.value = tempRange.length;
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
