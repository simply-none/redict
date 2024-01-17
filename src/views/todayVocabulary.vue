<!-- 展示当日完成的单词列表 -->
<template>
  <div v-loading="loading">
    <h3 class="today-voca-head">
      今日（{{ todayDate }}）背诵单词，共计：{{ vocalist.length }}个
      <el-link @click="lookTodayVocaMore" type="primary">查看更多...</el-link>
    </h3>
    <TablePage
      :showHandle="false"
      :linkToBing="true"
      :data="vocalistPage"
      :table-len="vocalist.length"
      :items="[
        { prop: 'n', label: '单词' },
        { prop: 'count', label: '次数' },
      ]"
      :tablePageSize="tablePageSize"
      @getData="getDataForToday"
    />

    <h3 class="today-voca-head">
      历史背诵单词，共计：{{ historyVocalist.length }}个，
      <el-link @click="exportData" type="primary">导出数据...</el-link>
    </h3>
    <TablePage
      :showHandle="true"
      :linkToBing="true"
      :data="historyVocalistPage"
      :table-len="historyVocalist.length"
      :items="[
        { prop: 'n', label: '单词' },
        { prop: 'count', label: '次数' },
        { prop: 'date', label: '日期' },
      ]"
      :tablePageSize="tablePageSize"
      @getData="getDataForHis"
    >
      <template v-slot:handle="{ data }">
        <el-button
          size="small"
          type="danger"
          @click="delWrod(data.row, data.$index)"
        >
          删除
        </el-button>
      </template>
    </TablePage>

    <h3 class="today-voca-head">
      非范围单词，共计：{{ rangeNotInBookData.length }}个
    </h3>
    <TablePage
      :showHandle="false"
      :linkToBing="true"
      :data="rangeNotInBookDataPage"
      :table-len="rangeNotInBookData.length"
      :items="[{ prop: 'n', label: '单词' }]"
      :tablePageSize="tablePageSize"
      @getData="getDataForNotRange"
    />
  </div>
</template>
<script setup lang="jsx">
import TablePage from "../components/tablePage.vue";
import { ref, reactive, onMounted, watch, toRaw } from "vue";
import {
  ElButton,
  ElIcon,
} from "element-plus";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import { useRoute, useRouter } from "vue-router";

import moment from "moment";

import { funDownloadByJson } from "../utils/generateFile";
import { delBFromA, filterBFromA } from "../utils/common";

let todayDate = ref(moment().format("YYYY-MM-DD"));

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable, schema } = useDB;

let todayTable = getTable("today-studied-voca");
let historyTable = getTable("studied-voca");

let vocalist = ref([]);
let vocalistPage = ref([]);
let historyVocalist = ref([]);
let historyVocalistPage = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let rangeNotInBookDataPage = ref([]);
let tablePageSize = ref(10);

let router = useRouter();

let loading = ref(true);

watch(
  basicData,
  () => {
    getVocaList();
    getHistoryVocaList();
    getBookRangeData();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  getVocaList();
  getHistoryVocaList();
  getBookRangeData();
});

function getDataForToday(current, newSize) {
  vocalistPage.value = getPageData(vocalist.value, current, newSize);
}

function getDataForHis(current, newSize) {
  historyVocalistPage.value = getPageData(
    historyVocalist.value,
    current,
    newSize
  );
}

function getDataForNotRange(current, newSize) {
  rangeNotInBookDataPage.value = getPageData(
    rangeNotInBookData.value,
    current,
    newSize
  );
}

function getPageData(data, current, newSize) {
  if (newSize) tablePageSize.value = newSize;
  let start = (current - 1) * tablePageSize.value;
  return data.slice(start, start + tablePageSize.value);
}

async function delWrod(data, index) {
  historyTable
    .where("id")
    .equals(data.id)
    .delete()
    .then(() => {
      historyVocalist.value.splice(index, 1);
    });
}

function lookTodayVocaMore() {
  router.push({
    name: "lookTodayVoca",
  });
}

watch(
  [bookData, rangeData],
  ([nBookData, nRangeData], [oBookData, oRangeData]) => {
    if (!nBookData || !nRangeData || !nBookData.length || !nRangeData.length) {
      return false;
    }

    console.log({ nBookData, nRangeData });
    loading.value = true;

    let nFromBook = nBookData.map((w) => w.n.toLowerCase());
    let nFromRange = nRangeData.map((w) => w.n.toLowerCase());

    rangeNotInBookData.value = delBFromA(nFromRange, nFromBook);
    rangeNotInBookData.value = rangeNotInBookData.value.map((w) => ({ n: w }));

    rangeNotInBookDataPage.value = getPageData(rangeNotInBookData.value, 1);

    loading.value = false;
  }
);

async function getBookTable() {
  let bookTable = getTable(basicData.value.currentBook);
  if (!bookTable) {
    return false;
  }
  bookTable.toArray().then((d) => {
    bookData.value = d;
  });
}

async function getRangeTable() {
  let rangeTable = getTable(basicData.value.currentRange);
  if (!rangeTable) {
    return false;
  }
  rangeTable.toArray().then((d) => {
    rangeData.value = d;
  });
}

function getBookRangeData() {
  if (!basicData.value.currentBook || !basicData.value.currentRange) {
    return false;
  }

  getBookTable();
  getRangeTable();
}

async function getVocaList() {
  if (!todayTable) {
    return false;
  }
  todayTable.toArray().then((d) => {
    vocalist.value = d;
    vocalistPage.value = getPageData(vocalist.value, 1)
  });
}

function exportData() {
  funDownloadByJson(Date.now() + ".json", historyVocalist.value);
}

async function getHistoryVocaList() {
  if (!historyTable) {
    return false;
  }
  historyTable.toArray().then((d) => {
    historyVocalist.value = d;
    historyVocalistPage.value = getPageData(historyVocalist.value, 1)
  });
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
