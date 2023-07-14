<template>
  <div>
    <el-empty ref="divRef" v-if="bookItemList.length === 0" />
    <div v-else ref="divRef" class="voca-card-wrap">
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
    <el-affix position="bottom" class="voca-card-handle-list">
      <el-button
        v-if="bookItemList.length === 0"
        size="large"
        class="voca-card-handle"
        @click="backToMainPage"
        >返回主页</el-button
      >
      <div class="voca-card-handle-list" v-else>
        <el-button
          plain
          type="warning"
          size="large"
          class="voca-card-handle2"
          @click="generateDom"
          >保存图片</el-button
        >
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
let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let router = useRouter();

let divRef = ref(null);

let bookItemList = ref([]);

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

getBookRangeData();

function backToMainPage() {
  router.push({ name: "wordMainPage" });
}

function generateDom() {
  if (!divRef.value) {
    return false;
  }
  let node = divRef.value;
  generateImage(node, "jpeg");
}

async function getBookRangeData() {
  let bookTable = await getTable(basicData.value.currentBook);
  let rangeTable = await getTable(basicData.value.currentRange);

  bookData.value = await bookTable.toArray();
  rangeData.value = await rangeTable.toArray();

  let todayTable = await getTable("today-studied-voca");
  let historyTable = await getTable("studied-voca");

  vocalist.value = await todayTable.toArray();

  historyVocalist.value = await historyTable.toArray();

  console.log(rangeData.value[0], historyVocalist.value);

  let tempRange = vocalist.value.map((w) => w.n.toLowerCase());
  tempRange = bookData.value.filter((w) =>
    tempRange.includes(w.n.toLowerCase())
  );
  bookItemList.value = tempRange;
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
</style>
