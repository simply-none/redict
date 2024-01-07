<template>
  <el-card
    class="voca-card"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="应用正在加载中..."
    element-loading-background="#eee"
  >
    <template #header>
      <div class="voca-card-head">
        <div class="voca-card-name">
          <span
            class="voca-card-name--inner"
            contenteditable="true"
            @blur="getSearchText($event, bookItem)"
            >{{ bookItem?.n }}</span
          >
            <el-button :icon="RefreshLeft" round plain type="success" v-show="bookItemBeforeSearch" @click="restoreBookItem">还原</el-button>
        </div>

        <el-button
          :icon="Setting"
          plain
          type="primary"
          circle
          class="voca-card-handle"
          @click="OpenSetting"
        ></el-button>
      </div>
    </template>
    <div class="voca-card-body" @dblclick="getWordItem">
      <ConciseWord
        v-if="basicData?.showMode === 'concise'"
        :basic-data="basicData"
        :book-item="bookItem"
      />
      <WordCom v-else :basic-data="basicData" :book-item="bookItem" />
    </div>
  </el-card>

  <SettingCom :visible="drawer" @handleDrawer="handleDrawer" />
</template>

<script setup>
import { ref, reactive, watchEffect, watch, onMounted, onUnmounted, toRaw } from "vue";

import { useVoca } from "../hooks/useVoca";

import SettingCom from "./Setting.vue";
import WordCom from "./word.vue";
import ConciseWord from "./conciseWord.vue";
import { ElNotification, ElMessage, ElLoading } from "element-plus";
import { Setting, RefreshLeft } from "@element-plus/icons-vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";
import { setNotify } from "../utils/element-plus";
import { useRouter } from "vue-router";

// 今日学习数据

let useBook = useBookStore();

let { basicData } = storeToRefs(useBook);

let {
  bookItem,
  bookItemBeforeSearch,
  fullscreenLoading,
  drawer,
  handleDrawer,
  getDataTest,
  getSearchText,
} = useVoca();

let router = useRouter()

if (router.currentRoute.value.query && router.currentRoute.value.query.reload) {
  location.href = './'
}

function OpenSetting () {
  drawer.value = true
  bookItemBeforeSearch.value = null
}

function restoreBookItem () {
  bookItem.value = toRaw(bookItemBeforeSearch.value)
  bookItemBeforeSearch.value = null

}

function getWordItem(e) {
  if (bookItemBeforeSearch.value) {
    setNotify('点击单词还原按钮后，再去切换单词')
    return false
  }
  let windowClientY = document.body.clientHeight;
  let windowClientX = document.body.clientWidth;
  let hasGet = windowClientX < e.clientX * 2;
  if (!hasGet) {
    getDataTest(false)
    return false;
  }
  getDataTest();
}

function arrowRightGetData(e) {
  if (bookItemBeforeSearch.value && ['ArrowRight', 'ArrowLeft'].includes(e.code)) {
    setNotify('点击单词还原按钮后，再去切换单词')
    return false
  }
  if (e.code === "ArrowRight") {
    getDataTest();
  }
  if (e.code === "ArrowLeft") {
    getDataTest(false)
  }
}

onMounted(() => {
  window.addEventListener("keyup", arrowRightGetData);
});

onUnmounted(() => {
  window.removeEventListener("keyup", arrowRightGetData);
});
</script>

<style scoped lang="scss">
.voca {
  &-card {
    height: 100%;
    :deep(.el-card__header) {
      background: #ffffff;
      color: #00badb;
      padding: 10px 20px;
    }
    :deep(.el-card__body) {
      height: calc(100% - 86px);
      overflow: auto;
      border: solid #00a4c1;
      border-width: 5px 2px 2px;
      padding: 6px;
      margin: 10px 20px;
    }
    &-name {
      font-size: 2em;
      display: inline-block;
    }
    &-name--inner {
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
      text-align: right;
      background-color: #ffffff;
      border-color: #ff9429;
      color: #ff9429;
      &:hover {
        box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
        color: #ffffff;
        border-color: #ff9429;
        background: #ff9429;
      }
    }

    &-body {
      // display: flex;
      // flex-flow: row nowrap;
      height: 100%;
      .left,
      .right {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
