<template>
  <el-card
    class="voca-card"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="应用正在加载中..."
    element-loading-background="#eee"
  >
    <template #header>
      <div class="voca-card-head">
        <span class="voca-card-name">{{ bookItem.n }}</span>

        <el-button
          :icon="Setting"
          plain
          type="primary"
          circle
          class="voca-card-handle"
          @click="drawer = true"
        ></el-button>
      </div>
    </template>
    <div class="voca-card-body" @click="getDataTest">
      <div class="left">
        <!-- 音标 -->
        <template
          class="voca-phonetic-item"
          v-for="phonetic in bookItem.p"
          :key="phonetic.id"
        >
          <span
            @click.stop="getFayin(phonetic.t || 'default')"
            class="voca-phonetic-type"
            >{{ phonetic.t }}</span
          >
          <span
            @click.stop="getFayin(phonetic.t || 'default')"
            class="voca-phonetic-type"
            >{{ phonetic.p }}</span
          >
          <audio
            preload="none"
            :ref="(el) => (fayinList[phonetic.t || 'default'] = el)"
          >
            <source :title="phonetic.a" type="audio/mpeg" :src="phonetic.a" />
            <!-- 如果浏览器不支持，则会呈现下面内容 -->
            <p>
              你的浏览器不支持HTML5音频，你可以<a href="audiofile.mp3">下载</a
              >这个音频文件。
            </p>
          </audio>
        </template>

        <template v-if="showVocabularyItem.includes('t')"
          ><div class="voca-card-voca-type" v-if="bookItem?.t?.length > 0">
            <template
              class="voca-card-voca-type-item"
              v-for="vocatype in bookItem.t"
              :key="vocatype.id"
            >
              <span>{{ vocatype.t }}</span
              >:
              <span>{{ vocatype.v }}</span>
            </template>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('ps')"
          ><div class="voca-card-voca-complex" v-if="bookItem?.ps?.length > 0">
            <div>简要解释：</div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem.ps"
              :key="vocatype.id"
            >
              <span>{{ vocatype.t }}</span
              >:
              <span>{{ vocatype.p.join(", ") }}</span>
            </div>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('pd')"
          ><div class="voca-card-voca-complex" v-if="bookItem?.pd?.length > 0">
            <div>中英双解：</div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem.pd"
              :key="vocatype.id"
            >
              <span>{{ vocatype.t }}</span
              >:
              <div v-for="voca in vocatype.p">
                <span>{{ voca.zh }}</span>
                <span>【{{ voca.en }}】</span>
              </div>
            </div>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('ph')"
          ><div class="voca-card-voca-complex" v-if="bookItem?.ph?.length > 0">
            <div>短语：</div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem.ph"
              :key="vocatype.id"
            >
              <span>{{ vocatype.en }}</span
              >:
              <span>{{ vocatype.zh }}</span>
            </div>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('sy')"
          ><div
            class="voca-card-voca-complex"
            v-if="bookItem?.sy?.v?.length > 0"
          >
            <div>同义词辨析：</div>
            <div>
              {{ bookItem?.sy?.v.join(", ") }}
            </div>
            <div>
              {{ bookItem?.sy?.d }}
            </div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem?.sy?.wordgroup"
              :key="vocatype.id"
            >
              <span>{{ vocatype.en }}</span
              >:
              <span>{{ vocatype.zh }}</span>
            </div>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('oth')"
          ><div class="voca-card-voca-complex" v-if="bookItem?.oth?.length > 0">
            <div>相关词汇：</div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem.oth"
              :key="vocatype.id"
            >
              <span>{{ vocatype.title }}</span
              >:
              <template v-for="voca in vocatype.vocabulary" :key="voca.id">
                <el-link target="_blank" :href="voca.u">{{ voca.v }}, </el-link>
              </template>
            </div>
          </div></template
        >

        <template v-if="showVocabularyItem.includes('col')"
          ><div class="voca-card-voca-complex" v-if="bookItem?.col?.length > 0">
            <div>词语搭配：</div>
            <div
              class="voca-card-voca-complex-item"
              v-for="vocatype in bookItem.col"
              :key="vocatype.id"
            >
              <span>{{ vocatype.t }}</span
              >:
              <div v-for="voca in vocatype.subtype" :key="voca.id">
                <div>{{ voca.t }}</div>
                <div>{{ voca.st }}</div>
                <div v-for="stl in voca.stl" :key="stl.id">
                  {{ stl }}
                </div>
              </div>
            </div>
          </div></template
        >
      </div>
      <!-- <div class="right">
        <pre>{{ bookItem }}</pre>
      </div> -->
    </div>
  </el-card>

  <SettingCom :visible="drawer" @handleDrawer="handleDrawer" />

  <el-dialog
    v-model="centerDialogVisible"
    :close-on-click-modal="false"
    title="已完成今日任务"
    width="30%"
    align-center
  >
    <span>正在开启复习模式，请稍后......</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="startReviewMode(false)">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import SettingCom from "./Setting.vue";
import { reactive, ref, onMounted, computed, toRaw, watch } from "vue";
import { ElNotification, ElMessage, ElLoading } from "element-plus";

import { Setting } from "@element-plus/icons-vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import moment from "moment";

import { useDatabaseTable } from "../hooks/useDatabaseTable";
import { useTodayStudyWords } from "../hooks/useTodayStudyWords";
import { useStudyWords } from "../hooks/useStudyWords";

// onMounted生命周期放顶部，不然控制台一大堆警告
onMounted(async () => {
  console.log("主体mounted");
  let isSetRequired = isSetRequiredData();
  if (!isSetRequired) {
    return false;
  }

  await initTodayStudyWordComp();

  await initStudyWordComp();

  reviewMode.value = moreThanTodayPlan();
  console.log(reviewMode.value, "是否开启");
});

const fullscreenLoading = ref(true);

let centerDialogVisible = ref(false);

let fayinList = reactive({});
let useBook = useBookStore();

let { getDatabaseTable } = useDatabaseTable();
let { todayStudyVocabulary, initTodayStudyWordComp } = useTodayStudyWords();
let {
  vocabularyCardInitData,
  showVocabularyCard,
  moreThanTodayPlan,
  initStudyWordComp,
} = useStudyWords();

let { showVocabularyItem, currentBook, currentRange, dbInstance, studyMode } =
  storeToRefs(useBook);
// let { getTable } = useBook

const drawer = ref(false);

let bookItem = ref({});

let reviewMode = ref(false);

ElNotification({
  type: "info",
  title: "提示",
  message: "你当前正处于" + studyMode.value + "模式",
  position: "bottom-right",
});

// 是否设置应用运行的必要数据，这个直接卸载vocab里面，非这里
function isSetRequiredData() {
  if (currentRange.value && currentBook.value && studyMode.value) {
    return true;
  }

  ElNotification({
    type: "error",
    title: "提示",
    message: "请完成基础设置后再试！",
    position: "bottom-right",
  });
  // 未设置打开弹出
  drawer.value = true;
  return false;
}

watch(
  () => vocabularyCardInitData.value,
  async (n, o) => {
    console.log("监听词汇", n);
    if (!n) {
      return false;
    }
    fullscreenLoading.value = false;
    bookItem.value = n;
  }
);

function startReviewMode(visible) {
  centerDialogVisible.value = visible;
}

function getFayin(uk) {
  const refuk = fayinList[uk];
  if (!refuk) {
    ElNotification({
      type: "error",
      title: "提示",
      message: "当前单词没有音源",
      position: "bottom-right",
    });
    return false;
  }
  refuk.load();
  setTimeout(() => {
    refuk.play();
  }, 1000);
}

function handleDrawer(visible) {
  drawer.value = visible;
}

async function getDataTest() {
  bookItem.value = await showVocabularyCard("update");
  fullscreenLoading.value = false;
  putStudiedVocabulary(toRaw(bookItem.value));
}

async function putStudiedVocabulary(data) {
  let table = await getDatabaseTable("studied-voca", "++id, n, date");

  let todayStudyWordsTable = await getDatabaseTable(
    "today-studied-voca",
    "++id"
  );
  let date = moment().format("YYYY-MM-DD");
  console.log(table, "table");

  let findPutData = await table.get(data.id);

  console.log(findPutData, "put dasta");

  let putData = {
    ...findPutData,
    id: data.id,
    n: data.n,
    date: date,
    count: findPutData?.count ? findPutData.count + 1 : 1,
  };
  if (studyMode.value === "study") {
    todayStudyVocabulary.value.push(putData.id);
    todayStudyWordsTable.put(putData);
  }

  table.put(putData);
}
</script>

<style scoped lang="scss">
.voca {
  &-phonetic-type {
    font-size: 6px;
    display: inline-block;
    cursor: pointer;
    color: #000;
    &:nth-child(2) {
      margin: 0 2em 0 0;
    }
  }
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
      border-width: 1em 6px 5px;
      padding: 6px;
      margin: 10px 20px;
      &::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
      }
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
      // justify-content: space-around;
      align-items: center;
      width: 100%;
      position: relative;
    }
    &-handle {
      position: absolute;
      text-align: right;
      right: 20px;
      color: #ffffff;
      border-color: #ff9429;
      background: #ff9429;
      // background-color: bisque !important;
      &:hover {
        box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
        background-color: #ffffff;
        border-color: #ff9429;
        color: #ff9429;
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
    &-voca-type {
      font-size: 0.8em;

      & > span {
        &:nth-child(even) {
          font-style: italic;
          margin-right: 1em;
        }
      }
    }

    &-voca-complex {
      margin: 12px 0;
      & > *:first-child {
        color: #008ea7;
        font-weight: 600;
        font-family: monospace;
      }
      &-item {
        color: #666;
      }
    }
  }
}
</style>
