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
        <div class="voca-card-voca-phonetic">
          <template
            v-for="phonetic in bookItem.p"
            :key="phonetic.id"
          >
            <span
              @click.stop="getFayin(phonetic.t || 'default')"
              class="voca-card-voca-phonetic-item"
              >{{ phonetic.t }}</span
            >
            <span
              @click.stop="getFayin(phonetic.t || 'default')"
              class="voca-card-voca-phonetic-item"
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
        </div>

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
              <span class="voca-card-voca-complex-type">{{ vocatype.t }}</span
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
              v-for="(vocatype, index) in bookItem.col"
              :key="vocatype.id"
            >
              <span class="voca-card-voca-complex-type">{{index + 1}}. {{ vocatype.t }}</span
              >:
              <div v-for="(voca, subindex) in vocatype.subtype" :key="voca.id">
                <div class="voca-card-voca-complex-type2">{{ (index + 1) + '.' + (subindex + 1) }}. {{ voca.t }}</div>
                <div class="voca-card-voca-complex-type3">{{ voca.st }}</div>
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
import { reactive, ref, onMounted, computed, toRaw, watch, watchEffect } from "vue";
import { ElNotification, ElMessage, ElLoading } from "element-plus";

import { Setting } from "@element-plus/icons-vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import moment from "moment";

// 今日学习数据

let useBook = useBookStore();

let databaseTableList = reactive({});

// 今日学习数据
let todayStudyWordsTable = ref();
let todayStudyWords = ref();

let couldStudyIndexData = ref([]);

// 展示的单词卡片数据
let vocabularyCardInitData = ref({});

// 获取书本学习的范围数据表
let range = ref();
let rangeWords = ref([]);

let table = ref();

// 获取已学习过的单词的数据表
let studyTalbe = ref();

let studyWords = ref([]);

let reviewMode = ref(false);

const fullscreenLoading = ref(true);

let centerDialogVisible = ref(false);

let fayinList = reactive({});

let {
  todayStudyVocabulary,
  showVocabularyItem,
  currentBook,
  currentRange,
  dbInstance,
  studyMode,
  studyCount,
} = storeToRefs(useBook);

let { updateBasicInfo } = useBook
// let { getTable } = useBook

const drawer = ref(false);

let bookItem = ref({});

// onMounted生命周期放顶部，不然控制台一大堆警告

watchEffect(() => {
  console.log(currentBook.value, currentRange.value, showVocabularyItem.value, studyMode.value, studyCount.value, '测试')
})


onMounted(async () => {
  let isSetRequired = await isSetRequiredData();
  if (!isSetRequired) {
    return false;
  }

  await initTodayStudyWordComp();

  await initStudyWordComp();

  reviewMode.value = moreThanTodayPlan();
});

// 今日是否已学习了50个单词，学习了就自动开启复习模式
function moreThanTodayPlan() {
  if (reviewMode.value) {
    return true;
  }
  if (studyMode.value !== 'study') {
    return true
  }
  if (todayStudyVocabulary.value.length >= studyCount.value) {
    // 弹出学习提示框（完成50个）
    // startReviewMode(true)
    setNotify('今日单词计划已完成，将开启复习模式！', 'success', '恭喜')
    reviewMode.value = true;
    return true;
  }
  return false;
}

// 获取能够展示单词卡片的索引
async function getCouldStudyIndexData() {
  if (!currentBook.value || !currentRange.value) {
    return [];
  }
  // 获取范围数据
  rangeWords.value = await getRangeWords();

  let studyIndexData = [];

  // 查看是否是复习过去的单词模式
  console.log(studyMode.value, "复习模式");
  if (studyMode.value === "review-past") {
    studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");
    studyWords.value = await studyTalbe.value.toArray()
    studyIndexData = toRaw(studyWords.value);
    studyIndexData = studyIndexData.map((word) => word.n);
    return studyIndexData;
  }

  // 超过今天计划，则自动开启复习模式
  if (moreThanTodayPlan()) {
    studyIndexData = await table.value
      .filter((word) => todayStudyVocabulary.value.includes(word.n))
      .toArray();
  } else {
    // 否则继续学习生词
    studyIndexData = await table.value
      .filter((word) => !studyWords.value.includes(word.n))
      .toArray();
    // 学习的生词，必须是在范围数据内的
    studyIndexData = studyIndexData.filter((word) =>
      rangeWords.value.includes(word.n)
    );
  }
  // 获取过滤后的可学习/复习的单词索引
  studyIndexData = studyIndexData.map((word) => word.n);

  return studyIndexData;
}

// 展示单词卡片
async function showVocabularyCard(update) {
  table.value = dbInstance.value.getTable(currentBook.value);
  let moreThanPlan = moreThanTodayPlan()
  // 这里就只对数据进行过滤，不读数据表了
  if (studyMode.value === "review-past") {
    
    studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");
    studyWords.value = await studyTalbe.value.toArray()
    console.log("复习模式", studyWords.value.length);
    couldStudyIndexData.value = (toRaw(studyWords.value || [])).map(word => word.n);
  } else {
    if (moreThanPlan) {
      couldStudyIndexData.value = toRaw(todayStudyVocabulary.value);
      couldStudyIndexData.value = [...new Set(couldStudyIndexData.value)];
    } else {
      couldStudyIndexData.value = couldStudyIndexData.value.filter(
        (word) => !todayStudyVocabulary.value.includes(word)
      );
    }
  }

  if (couldStudyIndexData.value.length === 0) {
    setNotify(`当前模式${studyMode.value}下，没有能够学习的单词，请切换模式！`)
    drawer.value = true;
    return false;
  }

  let random = Math.floor(Math.random() * couldStudyIndexData.value.length);

  if (studyMode.value === 'review-past' || moreThanPlan) {
    let lastVocabulary = bookItem.value?.n
    if (!lastVocabulary) {
      random = 0
    }
    let findIndex = couldStudyIndexData.value.findIndex(name => bookItem.value.n === name)
    let len = couldStudyIndexData.value.length
    if (findIndex === -1) {
      random = 0
    } else {
      random = findIndex + 1 === len ? 0 : findIndex + 1
    }
  }

  // 根据标识在总数据表中获取该标识对应的数据
  let vocabularycard = await table.value.get({ n: couldStudyIndexData.value[random] })
  // let vocabularycard = await table.value.get(couldStudyIndexData.value[random]);
  return vocabularycard;
}

// 获取范围数据
async function getRangeWords() {
  let rangeWords = [];
  // 范围数据表
  range.value = dbInstance.value.getTable(currentRange.value);

  // 范围数据
  rangeWords = await range.value.toArray();
  rangeWords = rangeWords.map((word) => word.n);

  return rangeWords;
}

async function initStudyWordComp() {
  // 加载已学习的数据表
  studyTalbe.value = await getDatabaseTable("studied-voca", "++id, n, date");

  // 已学习数据
  studyWords.value = await studyTalbe.value.toArray();
  studyWords.value = studyWords.value.map((word) => word.n);

  // 全部单词的数据表
  table.value = dbInstance.value.getTable(currentBook.value);

  couldStudyIndexData.value = await getCouldStudyIndexData();

  if (table.value) {
    vocabularyCardInitData.value = await showVocabularyCard();
  }
}

async function initTodayStudyWordComp() {
  todayStudyWordsTable.value = await getDatabaseTable(
    "today-studied-voca",
    "++id"
  );
  todayStudyWords.value = await todayStudyWordsTable.value.toArray();

  // 看是否是今日学习单词，如果不是，则清空今日单词库
  let isToday = moment().format("YYYY-MM-DD");
  if (todayStudyWords.value.length > 0) {
    let getWords = todayStudyWords.value[0];
    if (isToday !== getWords.date) {
      await todayStudyWordsTable.value.orderBy().delete();
    }
  }

  todayStudyWords.value = await todayStudyWordsTable.value.toArray();

  todayStudyWords.value = todayStudyWords.value.map((word) => word.n);

  // 将数据库中今日学习单词，合并到当前的状态管理对象中
  todayStudyVocabulary.value = [
    ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
  ];
}

// 获取数据表，无则创建表
async function getDatabaseTable(tableName, tableSchema) {
  if (databaseTableList[tableName]) {
    return databaseTableList[tableName];
  }
  let loadTable = dbInstance.value.getTable(tableName);
  if (!loadTable) {
    await dbInstance.value.addTable(tableName, tableSchema);
    loadTable = dbInstance.value.getTable(tableName);
  }
  databaseTableList[tableName] = loadTable;
  return loadTable;
}

function sleep (time) {
  return new Promise((resolve) => {
    return setTimeout(() => {
      console.log('休眠中...')
      resolve()
    }, time)
  });
}

function setNotify (msg, type, title) {
  ElNotification({
    type: type || "error",
    title: title || "提示",
    message: msg,
    duration: 5000,
    position: "bottom-right",
  });
}



// 是否设置应用运行的必要数据，这个直接卸载vocab里面，非这里
async function isSetRequiredData() {
  // 这里，不更新下基础信息，会报错（处理的真久）
  await updateBasicInfo()

  console.time('a')
  await sleep(500)
  console.timeEnd('a')

  let message = "你当前正处于" + studyMode.value + "模式" + '，范围值：' + currentRange.value + '，当前课本：' + currentBook.value
  if (currentRange.value && currentBook.value && studyMode.value) {
    setNotify(message, 'success')
    return true;
  }
  
  setNotify(message + ', 请完成基础设置后再试！')
  // 未设置打开弹出
  drawer.value = true;
  return false;
}

watch(
  () => vocabularyCardInitData.value,
  async (n, o) => {
    if (!n) {
      return false;
    }
    fullscreenLoading.value = false;
    if (!Object.keys(bookItem.value).length) {
      bookItem.value = n;
    }
  }
);

function startReviewMode(visible) {
  centerDialogVisible.value = visible;
}

function getFayin(uk) {
  const refuk = fayinList[uk];
  if (!refuk) {
    setNotify('当前单词没有音源')
    return false;
  }
  refuk.load();
  setTimeout(() => {
    refuk.play();
  }, 1000);
}

async function handleDrawer(payload) {
  drawer.value = payload.drawer;
  if (!payload.drawer) {
    table.value = dbInstance.value.getTable(currentBook.value);
    couldStudyIndexData.value = await getCouldStudyIndexData();

    if (table.value) {
      vocabularyCardInitData.value = await showVocabularyCard();
    }
  }
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

  let findPutData = await table.get({ n: data.n });

  let putData = {
    ...findPutData,
    id: data.id,
    n: data.n,
    date: date,
    count: findPutData?.count ? findPutData.count + 1 : 1,
  };
  if (studyMode.value === "study") {
    todayStudyVocabulary.value.push(putData.n);
    todayStudyWordsTable.put(putData);
  }

  table.put(putData);
}
</script>

<style scoped lang="scss">
.voca {
  &-card-voca-phonetic {
    &-item {
      font-size: 1em;
      font-weight: 900;
    display: inline-block;
    cursor: pointer;
    color: #666;
    &:nth-child(2) {
      margin: 0 1em 0 0;
    }
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
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    &-handle {
      text-align: right;
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
      font-size: 1em;

      & > span {
      font-weight: 100;
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
      &-type {
        display: inline-block;
        margin: 3px 0;
        color: #666;
        font-weight: 600;
      }
      &-type2 {
        display: block;
        margin: 3px 0;
        color: #808080;
        font-weight: 600;
      }
      &-type3 {
        text-decoration: underline;
        margin: 3px 0;
      }
      &-item {
        color: #666;
      }
    }
  }
}
</style>
