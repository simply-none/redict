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
<script setup lang="jsx">
import { ref, reactive, onMounted, watch } from "vue";
import { TableV2SortOrder, TableV2FixedDir, ElButton, ElIcon } from "element-plus";

import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";

import { useRoute, useRouter } from "vue-router";

import moment from "moment";

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
  }
);

onMounted(() => {
  getVocaList();
  getHistoryVocaList();
  getBookRangeData();
});

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
  await historyTable.where("id").equals(data.id).delete();
  historyVocalist.value.splice(index, 1)
}

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
