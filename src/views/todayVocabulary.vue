<!-- 展示当日完成的单词列表 -->
<template>
  <div v-loading="loading">
    <h3 class="today-voca-head">
      今日（{{ todayDate }}）背诵单词，共计：{{ vocalist.length }}个
      <el-link @click="lookTodayVocaMore" type="primary">查看更多...</el-link>
    </h3>
    <el-table
      :data="vocalist"
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
    </el-table>

    <h3 class="today-voca-head">
      历史背诵单词，共计：{{ historyVocalist.length }}个，
      <el-link @click="exportData" type="primary">导出数据...</el-link>
    </h3>
    <div style="height: 300px">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
            ref="tableRef"
            :columns="columns"
            :data="historyVocalist"
            :width="width"
            :height="height"
            :cache="10"
            v-model:sort-state="sortState"
            @column-sort="onSort"
          />
        </template>
      </el-auto-resizer>
    </div>

    <h3 class="today-voca-head">
      非范围单词，共计：{{ rangeNotInBookData.length }}个
    </h3>
    <TablePage :data="rangeNotInBookDataPage" :table-len="rangeNotInBookData.length" :items="[{prop: 'n', label: '单词'}]" :tablePageSize="tablePageSize" @getData="(current) => getPageData(rangeNotInBookData, current)"/>
  </div>
</template>
<script setup lang="jsx">
import TablePage from '../components/tablePage.vue'
import { ref, reactive, onMounted, watch, toRaw } from "vue";
import {
  TableV2SortOrder,
  TableV2FixedDir,
  ElButton,
  ElIcon,
} from "element-plus";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import { useRoute, useRouter } from "vue-router";

import moment from "moment";

import { funDownloadByJson } from "../utils/generateFile";

import Worker from "../utils/getStoreWebWork.js?worker";

const sortState = ref({
  n: TableV2SortOrder.ASC,
  date: TableV2SortOrder.ASC,
  count: TableV2SortOrder.ASC,
});

let columns = reactive([
  {
    key: "index",
    dataKey: "index",
    width: 100,
    cellRenderer: ({ rowIndex }) => {
      return <div>{rowIndex}</div>;
    },
    title: "序号",
  },
  {
    key: "n",
    dataKey: "n",
    width: 200,
    title: "单词",
    sortable: true,
  },
  {
    key: "count",
    dataKey: "count",
    width: 100,
    title: "次数",
    sortable: true,
  },
  {
    key: "date",
    dataKey: "date",
    width: 100,
    title: "日期",
    sortable: true,
  },
  {
    key: "del",
    dataKey: "del",
    width: 100,
    title: "操作",
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: (data) => {
      return (
        <>
          <ElButton
            size="small"
            type="danger"
            onClick={() => delWrod(data.rowData, data.rowIndex)}
          >
            删除
          </ElButton>
        </>
      );
    },
  },
]);

let todayDate = ref(moment().format("YYYY-MM-DD"));

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable, schema } = useDB;

let todayTable = getTable("today-studied-voca");
let historyTable = getTable("studied-voca");

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

let rangeNotInBookData = ref([]);

let rangeNotInBookDataPage = ref([]);
let tablePageSize = ref(100)

let couldDataLen = ref(0);

let router = useRouter();

let loading = ref(true)

let worker = new Worker();

worker.addEventListener("message", (e) => {
  console.log(e, "监听数据");
  rangeNotInBookData.value = JSON.parse(e.data).rangeNotInBookData;
  getPageData(rangeNotInBookData.value, 1)
  loading.value = false
});

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

function getPageData (data, current) {
  let start = (current - 1) * tablePageSize.value
  rangeNotInBookDataPage.value = data.slice(start, start + tablePageSize.value)
}

function onSort({ key, order }) {
  sortState.value[key] = order;
  historyVocalist.value.sort((a, b) => {
    if (a[key] > b[key]) {
      return 1;
    }
    return -1;
  });
  historyVocalist.value =
    order === "asc" ? historyVocalist.value : historyVocalist.value.reverse();
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

    console.log({nBookData, nRangeData})

    worker.postMessage({nBookData: toRaw(nBookData), nRangeData: toRaw(nRangeData)})
    loading.value = true
  }
);

async function getBookTable() {
  let bookTable = getTable(basicData.value.currentBook);
  bookTable.toArray().then((d) => {
    bookData.value = d;
  });
}

async function getRangeTable() {
  let rangeTable = getTable(basicData.value.currentRange);
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
  todayTable.toArray().then((d) => {
    vocalist.value = d;
  });
}

function exportData() {
  funDownloadByJson(Date.now() + ".json", historyVocalist.value);
}

async function getHistoryVocaList() {
  historyTable.toArray().then((d) => {
    historyVocalist.value = d;
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
