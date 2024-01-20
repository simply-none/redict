<template>
  <div
    class="vocabulary-list"
    :class="{ simple: simpleStyle }"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="数据正在加载中..."
    element-loading-background="#eee"
    @dblclick="toggleOperateBtn"
  >
    <el-affix
      position="top"
      class="voca-card-handle-top"
      :class="{ hiddenOperation: hiddenOperation }"
    >
      <div class="select-word-type">
        <el-radio-group
          v-model="selectWordType"
          @change="changeWordType"
          class="select-word-type--inner"
        >
          <el-radio-button
            v-for="(typeData, type) in wordType"
            :key="type"
            :label="typeData.name"
          >
            {{ typeData.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <el-pagination
        v-if="simpleStyle"
        small
        background
        layout="pager, slot"
        :total="wordType[selectWordType].count"
        v-model:current-page="current"
        :page-size="pageSize"
        @current-change="changeCurrentPage"
      >
        <el-select
          size="small"
          :name="pageSize + '条/页'"
          v-model="pageSize"
          placeholder=""
          @change="changePageSize"
        >
          <el-option
            v-for="ps in pageSizeList"
            :key="ps"
            :label="ps + '条/页'"
            :value="ps"
          />
          <template #footer>
            <el-button
              v-if="!isCustomPagesize"
              text
              bg
              size="small"
              @click="openCustomPageSizePanel"
            >
              添加自定义分页
            </el-button>
            <template v-else>
              <el-input v-model="customPagesize" size="small" />
              <el-button type="primary" size="small" @click="addCustomPageSize">
                添加
              </el-button>
              <el-button size="small" @click="isCustomPagesize = false"
                >取消</el-button
              >
            </template>
          </template>
        </el-select>
      </el-pagination>
    </el-affix>
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
            class="voca-card-handle2 voca-card-handle2-1"
          >
            操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                {{ simpleStyle ? "美化布局" : "简单布局" }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          class="voca-card-handle2 voca-card-handle2-2"
          size="large"
          @click="backToMainPage"
          >返回主页</el-button
        >
      </div>
    </el-affix>
  </div>
</template>

<script setup>

import { ref, toRefs, reactive, onMounted, watch, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";

import WordCom from "../../components/word.vue";

import { useBookStore } from "../../stores/books";
import useDBStore from "../../stores/db";
import useTableStore from "../../stores/table";

import { generateImage } from "../../utils/generateFile";
import { funDownloadByJson, funDownloadByHtml2Md } from "../../utils/generateFile";
import { setNotify } from "../../utils/element-plus";

let { getDBTable, getDBTableData } = useTableStore();

let fullscreenLoading = ref(true);

let simpleStyle = ref(true);

let wordType = reactive({
  today: {
    name: "today",
    label: "今日",
    table: null,
    data: null,
    count: 0,
    current: 1,
  },
  history: {
    name: "history",
    label: "历史",
    table: null,
    data: null,
    count: 0,
    current: 1,
  },
  range: {
    name: "range",
    label: "单词本",
    table: null,
    data: null,
    count: 0,
    current: 1,
  },
  book: {
    name: "book",
    label: "词典源",
    table: null,
    data: null,
    count: 0,
    current: 1,
  },
});

let { today, history, range, book } = toRefs(wordType);
let table = ref({});

let selectWordType = ref("today");

let showEntireBook = ref(false);
let showEntireRange = ref(false);

let hiddenOperation = ref(true);
let current = ref(1);
let pageSize = ref(10);
let pageSizeList = ref([5, 10, 20, 30, 50]);

let isCustomPagesize = ref(false);
let customPagesize = ref();
let localPageSize = ref([]);

let lastCurrent = ref({});

let useBook = useBookStore();
let useDB = useDBStore();

let { basicData } = storeToRefs(useBook);
let { getTable } = useDB;

let router = useRouter();

let divRef = ref(null);

let bookItemList = ref([]);

getlocalWordListPageSize();

watchEffect(() => {
  if (
    basicData.value.currentBook && 
    basicData.value.currentRange
  ) {
    // 初始化首屏数据
    console.log("初始化", JSON.stringify(basicData.value));
    getDataFromDBList();
  }
})

watch(table, () => {
  if (
    table.value.book &&
    table.value.range &&
    table.value.today &&
    table.value.history
  ) {
    // 初始化首屏数据
    console.log("初始化", table.value);
    getWordTypedList("today");
  }
});

function openCustomPageSizePanel() {
  isCustomPagesize.value = true;
}

function getlocalWordListPageSize() {
  let localWordListPageSize = localStorage.getItem("word-list-page-size");
  if (!localWordListPageSize) {
    localStorage.setItem("word-list-page-size", JSON.stringify([]));
    localPageSize.value = [];
  } else {
    localPageSize.value = JSON.parse(localWordListPageSize);
    addLocalPageSizeToList(localPageSize.value)
  }
}

function addLocalPageSizeToList (localPs) {
  pageSizeList.value
    .push(...localPs)
    
  localStorage.setItem("word-list-page-size", JSON.stringify(localPageSize.value));

  pageSizeList.value.sort((a, b) => (a > b ? 1 : -1));
}

function addCustomPageSize() {
  let cusPs = Number(customPagesize.value);
  console.log(cusPs, '页码')
  if (isNaN(cusPs) || cusPs > 200) {
    setNotify("请输入200以内的数字");
    return false;
  }
  localPageSize.value
    .push(cusPs);

  addLocalPageSizeToList(localPageSize.value)

  console.log(pageSizeList.value);
  isCustomPagesize.value = false;
}

function changeWordType(type) {
  console.log(type, "type");

  current.value = wordType[type].current;

  getWordTypedList(type);
}

function backToMainPage() {
  router.push({
    name: "wordMainPage",
  });
}

function toggleOperateBtn(e) {
  console.log(e);
  hiddenOperation.value = !hiddenOperation.value;
}

function changePageSize(size) {
  console.log(size, "说是");
  pageSize.value = size;
  let newPageTotal = Math.ceil(
    wordType[selectWordType.value].count / pageSize.value
  );
  wordType[selectWordType.value].current =
    wordType[selectWordType.value].current > newPageTotal
      ? newPageTotal
      : wordType[selectWordType.value].current;

  getWordTypedList(selectWordType.value);
}

function changeCurrentPage(cur) {
  console.log("当前页改变");
  current.value = cur;
  let type = selectWordType.value;

  wordType[type].current = current.value;

  getWordTypedList(selectWordType.value);
}

function generateMDFile() {
  funDownloadByHtml2Md(Date.now() + "_背诵的markdown数据.md", divRef.value);
}

function generateJsonFile() {
  funDownloadByJson(Date.now() + ".json", wordType[selectWordType.value].data);
}

function generateDom() {
  if (!divRef.value) {
    return false;
  }
  let node = divRef.value;
  generateImage(node, "jpeg");
}

function getDataFromDB(getDBFn, getDBFnArgs, ref, operation) {
  return getDBFn(...getDBFnArgs).then((data) => {
    if (operation === "setValue") {
      ref.value.table = data;
      // 设置一个table对象，便于初始化监听
      table.value = {
        ...table.value,
        [ref.value.name]: data,
      };
    }
    data.count().then((c) => {
      console.log(c, "数量", ref.value.name);
      ref.value.count = c || 0;
    });
    return data;
  });
}

function getDataFromDBList() {
  console.log("牛了");
  // 加载所有相关表
  // 学习过的数据表
  getDataFromDB(
    getDBTable,
    ["studied-voca", "++id, n, date"],
    history,
    "setValue"
  );
  // 今日数据表
  getDataFromDB(getDBTable, ["today-studied-voca", "++id, n, date"], today, "setValue");

  // 总数据表
  getDataFromDB(
    getDBTable,
    [basicData.value.currentBook, ""],
    book,
    "setValue"
  );

  // 范围表
  getDataFromDB(
    getDBTable,
    [basicData.value.currentRange, ""],
    range,
    "setValue"
  );
}

async function getWordTypedList(type) {
  fullscreenLoading.value = true;
  console.log(wordType[type], wordType[type].current - 1, "开始");

  console.log(wordType[type].current, "之前的缓存码");

  let data = await wordType[type].table.orderBy('n')
    .offset((wordType[type].current - 1) * pageSize.value)
    .limit(pageSize.value)
    .toArray();
  data = data.map((l) => (l.n || "").toLowerCase());
  console.log(data, type, "结束");
  book.value.table.count().then(d => console.log(d, '数量'))

  book.value.table
    .filter((item) => data.includes(item.n.toLowerCase()))
    .toArray()
    .then((d) => {
      bookItemList.value = d;
      wordType[type].data = d;
      console.log(d, type);
      fullscreenLoading.value = false;
    });
}
</script>

<style scoped lang="scss">

.vocabulary-list {
  height: 100%;
}
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
    color: #00a4c1;
    border-color: #00a4c1;
    background-color: #ffffff;
    border-radius: 0;
    &:hover {
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
      background: #00a4c1;
      border-color: #00a4c1;
      color: #ffffff;
    }
  }
  &-handle-top {
    .el-pagination {
      padding: 5px 0;
      border-bottom: 1px solid black;
      margin-bottom: 5px;
    }
    .select-word-type {
      padding: 3px 4px;
      &--inner {
        width: 100%;
        .el-radio-button {
          width: 25%;
        }
        :deep(.el-radio-button__inner) {
          width: 100%;
          display: inline-block;
        }
      }
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
    &-1 {
      border-radius: var(--el-border-radius-base) 0 0
        var(--el-border-radius-base);
      border-right: 0;
    }
    &-2 {
      border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base)
        0;
    }
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
    background: white;
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
          color: #7d7d7d;
          font-size: initial;
        }
      }
      .voca-card-voca-phonetic-item[data-v-2bc55690] {
        font-size: 1em;
        font-weight: 300;
        display: inline-block;
        cursor: pointer;
        color: #a1a1a1;
      }
    }
    .el-card__header {
      padding: 0;
      color: #555;
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
