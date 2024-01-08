<template>
  <div
    :class="{ simple: simpleStyle }"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="数据正在加载中..."
    element-loading-background="#eee"
    @dblclick="onScroll"
  >
    <el-empty ref="divRef" v-if="bookItemList.length === 0" />
    <div v-else ref="divRef" class="voca-card-wrap">
      <el-affix
        position="top"
        class="voca-card-handle-top"
        :class="{ hiddenOperation: hiddenOperation }"
      >
        <el-pagination
          v-if="simpleStyle"
          small
          background
          layout="pager"
          :total="showEntireBook ? bookData.length : (showEntireRange ? rangeData.length : bookItemList.length)"
          class="mt-4"
          :page-size="100"
          @current-change="onCurrentChange"
        />
      </el-affix>

      <el-card
        class="voca-card"
        v-for="bookItem in bookItemList"
        :key="bookItem.id"
      >
        <template #header>
          <div class="voca-card-head">
            <span class="voca-card-name">{{ bookItem.n }}</span>
          </div>
        </template>
        <div class="voca-card-body">
          <WordCom :basic-data="basicData" :book-item="bookItem" />
        </div>
      </el-card>
    </div>
    <el-affix
      position="bottom"
      class="voca-card-handle-list"
      :class="{ hiddenOperation: hiddenOperation }"
    >
      <el-button
        v-if="bookItemList.length === 0"
        size="large"
        class="voca-card-handle"
        @click="backToMainPage"
        >返回主页</el-button
      >
      <div class="voca-card-handle-list" v-else>
        <el-dropdown class="voca-card-handle2">
          <el-button
            plain
            type="warning"
            size="large"
            class="voca-card-handle2"
          >
            导出<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="generateDom">保存图片</el-dropdown-item>
              <el-dropdown-item @click="generateJsonFile"
                >保存json</el-dropdown-item
              >
              <el-dropdown-item @click="generateMDFile"
                >保存Markdown</el-dropdown-item
              >
              <el-dropdown-item @click="simpleStyle = !simpleStyle">
                {{ simpleStyle ? "布局还原" : "简单模式" }}
              </el-dropdown-item>
              <el-dropdown-item @click="onShowEntireRange">
                {{ showEntireRange ? "数据还原" : "展示整本范围数据" }}
              </el-dropdown-item>
              <el-dropdown-item @click="onShowEntireBook">
                {{ showEntireBook ? "数据还原" : "展示整本课本数据" }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          class="voca-card-handle2"
          size="large"
          @click="backToMainPage"
          >返回主页</el-button
        >
      </div>
    </el-affix>
  </div>
</template>

<script setup>
import { useBookStore } from "../stores/books";
import useDBStore from "../stores/db";
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";

import { generateImage } from "../utils/generateFile";

import WordCom from "./word.vue";

import moment from "moment";

import { funDownloadByJson, funDownloadByHtml2Md } from "../utils/generateFile";

let fullscreenLoading = ref(true);

let simpleStyle = ref(true);
let showEntireBook = ref(false);
let showEntireRange = ref(false);
let hiddenOperation = ref(true);
let current = ref(1);

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let router = useRouter();

let divRef = ref(null);

let bookItemList = ref([]);
let bookItemListOrigin = ref([]);

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

getBookRangeData();

function backToMainPage() {
  router.push({ name: "wordMainPage", query: {
    reload: true
  } });
}

function onScroll(e) {
  console.log(e);
  hiddenOperation.value = !hiddenOperation.value;
}

function onCurrentChange(cur) {
  current.value = cur;
  bookItemList.value = bookData.value.slice(
    (current.value - 1) * 100,
    (current.value - 1) * 100 + 100
  );
}

function onShowEntireBook() {
  showEntireBook.value = !showEntireBook.value;
  bookItemList.value = showEntireBook.value
    ? bookData.value.slice(
        (current.value - 1) * 100,
        (current.value - 1) * 100 + 100
      )
    : bookItemListOrigin.value;
}

function onShowEntireRange() {
  showEntireRange.value = !showEntireRange.value;
  bookItemList.value = showEntireRange.value
    ? rangeData.value.slice(
        (current.value - 1) * 100,
        (current.value - 1) * 100 + 100
      )
    : bookItemListOrigin.value;
}

function generateMDFile() {
  funDownloadByHtml2Md(Date.now() + "_背诵的markdown数据.md", divRef.value);
}

function generateJsonFile() {
  funDownloadByJson(Date.now() + ".json", bookData.value);
}

function generateDom() {
  if (!divRef.value) {
    return false;
  }
  let node = divRef.value;
  generateImage(node, "jpeg");
}

async function getBookRangeData() {
  fullscreenLoading.value = true;
  let bookTable = await getTable(basicData.value.currentBook);
  let rangeTable = await getTable(basicData.value.currentRange);

  bookData.value = await bookTable.toArray();
  rangeData.value = await rangeTable.toArray();
  rangeData.value = rangeData.value.map((w) => w.n.toLowerCase());

  rangeData.value = bookData.value.filter(w => rangeData.value.includes(w.n.toLowerCase()))
  console.log(rangeData.value.length, '查昂都', rangeData.value)

  let todayTable = await getTable("today-studied-voca");
  let historyTable = await getTable("studied-voca");

  vocalist.value = await todayTable.toArray();

  historyVocalist.value = await historyTable.toArray();

  let tempRange = vocalist.value.map((w) => w.n.toLowerCase());
  tempRange = bookData.value.filter((w) =>
    tempRange.includes(w.n.toLowerCase())
  );
  bookItemListOrigin.value = tempRange;
  bookItemList.value = tempRange;
  fullscreenLoading.value = false;
}
</script>

<style scoped lang="scss">
.voca-card {
  margin: 10px;
  :deep(.el-card__header) {
    background: #ffffff;
    color: #00badb;
    padding: 10px 20px;
  }
  :deep(.el-card__body) {
    height: calc(100% - 86px);
    overflow: auto;
    border: solid #00a4c1;
    border-width: 1em 6px 5px;
    padding: 6px;
    margin: 10px 20px;
    &::-webkit-scrollbar {
      /*隐藏滚轮*/
      display: none;
    }
  }
  &-wrap {
    width: 100%;
    padding: 10px 0;
    background: #fff;
    height: fit-content;
  }
  &-name {
    font-size: 2em;
    padding-right: 12px;
    display: inline-block;
    font-weight: 900;
  }
  &-head {
    display: inline-flex;
    flex-flow: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  &-handle {
    width: calc(100% - 20px);
    margin-left: 10px;
    text-align: right;
    color: #ffffff;
    border-color: #00a4c1;
    background: #00a4c1;
    border-radius: 0;
    &:hover {
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
      background-color: #ffffff;
      border-color: #00a4c1;
      color: #00a4c1;
    }
  }
  &-handle-top {
    background: white;
    .el-pagination {
      padding-bottom: 10px;
    }
  }
  &-handle-list {
    display: inline-flex;
    justify-content: center;
    width: 100%;
    padding: 0 10px;
  }
  &-handle2 {
    flex: 1;
  }

  &-body {
    display: flex;
    flex-flow: row nowrap;
    height: 100%;
    .left,
    .right {
      width: 100%;
    }
  }
}

:deep(.el-affix) {
  width: 100% !important;
  & > div {
    width: 100% !important;
  }
}

.simple {
  :deep(.el-card) {
    box-shadow: none;
    border: none;
    margin: 0 10px;
    font-size: 1em;

    .el-card__body {
      border: none;
      padding: 0px;
      margin: 0;
      .left {
        border: none;
      }
      .voca-card-voca-complex {
        margin: 3px 0;
        & > *:first-child {
          color: #153c43;
          font-size: initial;
        }
      }
    }
    .el-card__header {
      padding: 0;
      color: #7d7d7d;
      .voca-card-name {
        font-size: 1.2em;
      }
    }
  }
  // :deep(.el-card__body) {
  //   border: solid #00a4c1;
  //   border-width: 1px;
  //   padding: 0px;
  //   margin: 0;
  // }
  // :deep(.el-card__header) {
  //   padding: 0;
  // }
}

.hiddenOperation {
  display: none;
}
</style>
