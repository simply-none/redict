<!-- 展示当日完成的单词列表 -->
<template>
  <div v-loading="loading">
    <h3 class="today-voca-head">
      今日（{{ todayDate }}）背诵单词，共计：{{ todayWords?.length }}个
      <el-link @click="lookTodayVocaMore" type="primary">查看更多...</el-link>
    </h3>
    <TablePage :showHandle="false" :linkToBing="true" :data="pageTodayWords" :table-len="todayWords?.length" :items="[
      { prop: 'n', label: '单词' },
      { prop: 'count', label: '次数' },
    ]" :tablePageSize="tablePageSize" @getData="getPageTodayWords" />

    <h3 class="today-voca-head">
      历史背诵单词，共计：{{ historyWords?.length }}个，
      <el-link @click="exportData" type="primary">导出数据...</el-link>
    </h3>
    <TablePage :showHandle="true" :linkToBing="true" :data="pageHistoryWords" :table-len="historyWords?.length" :items="[
      { prop: 'n', label: '单词' },
      { prop: 'count', label: '次数' },
      { prop: 'date', label: '日期' },
    ]" :tablePageSize="tablePageSize" @getData="getPageHistoryWords">
      <template v-slot:handle="{ data }">
        <el-button size="small" type="danger" @click="delWrod(data.row, data.$index)">
          删除
        </el-button>
      </template>
    </TablePage>

    <h3 class="today-voca-head">
      非范围单词，共计：{{ notStudyWords?.length }}个
    </h3>
    <TablePage :showHandle="false" :linkToBing="true" :data="pageNotStudyWords" :table-len="notStudyWords?.length"
      :items="[{ prop: 'n', label: '单词' }]" :tablePageSize="tablePageSize" @getData="getPageNotStudyWords" />
  </div>
</template>
<script setup lang="jsx">

import { ref, reactive, onMounted, watch, toRaw } from "vue";
import { ElButton, ElIcon } from "element-plus";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";

import TablePage from "../../components/tablePage.vue";

import { useWordStore } from "../../stores/words";

import { funDownloadByJson } from "../../utils/generateFile";

let todayDate = ref(moment().format("YYYY-MM-DD"));

let useWord = useWordStore();

let {
  todayWords,
  historyWords,
  bookWords,
  dictWords,
  willStudyWords,
  notStudyWords,
} = storeToRefs(useWord);
let { setAllTypedWords, setWillStudyWords, getPageFromTalbe, delDataByIdInHistoryTable } = useWord;

let pageTodayWords = ref([]);
let pageHistoryWords = ref([]);

let pageNotStudyWords = ref([]);
let tablePageSize = ref(10);

let router = useRouter();

let loading = ref(false);

getPageTodayWords(1, 10)
getPageHistoryWords(1, 10)
getPageNotStudyWords(1, 10);

function stopInTotalThanCurrent(total, current, pageSize) {
  let maxCur = Math.ceil(total / pageSize)
  return current > maxCur
}

function getPageTodayWords(current, newSize) {
  if (stopInTotalThanCurrent(todayWords.value?.length, current, newSize)) {
    return false
  }
  getPage("today", current, newSize).then((d) => {
    pageTodayWords.value = d;
  });
}

function getPageHistoryWords(current, newSize) {
  if (stopInTotalThanCurrent(historyWords.value?.length, current, newSize)) {
    return false
  }
  console.log(current, newSize, '测试')
  getPage("history", current, newSize).then((d) => {
    pageHistoryWords.value = d;
  });
}

function getPageNotStudyWords(current, newSize) {
  if (newSize) tablePageSize.value = newSize;
  let start = (current - 1) * tablePageSize.value;
  pageNotStudyWords.value = (notStudyWords.value || [])
    .slice(start, start + tablePageSize.value)
    .map((n) => ({ n }));
}

function getPage(type, current, newSize) {
  if (newSize) tablePageSize.value = newSize;
  let start = (current - 1) * tablePageSize.value;

  return getPageFromTalbe(type, start, tablePageSize.value).then((d) => {
    console.log(d, "阿布");
    return d;
  });
}

async function delWrod(data, index) {
  delDataByIdInHistoryTable(data, index)
}

function lookTodayVocaMore() {
  router.push({
    name: "namedWordList",
  });
}

function exportData() {
  funDownloadByJson(Date.now() + ".json", historyWords.value);
}
</script>
<style lang="scss" scoped>
.today-voca {
  &-head {
    padding: 1em 0;
    color: #666;
  }
}
</style>
