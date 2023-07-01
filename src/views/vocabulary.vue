<template>
  <el-card class="voca-card">
    <template #header>
      <div class="voca-card-head">
        <span class="voca-card-name">{{ bookItem.n }}</span>
        <template
          class="voca-phonetic-item"
          v-for="phonetic in bookItem.p"
          :key="phonetic.id"
        >
          <span
            @click="getFayin(phonetic.t || 'default')"
            class="voca-phonetic-type"
            >{{ phonetic.t }}</span
          >
          <span
            @click="getFayin(phonetic.t || 'default')"
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
        <div class="voca-card-voca-type" v-if="bookItem?.t?.length > 0">
          <template
            class="voca-card-voca-type-item"
            v-for="vocatype in bookItem.t"
            :key="vocatype.id"
          >
            <span>{{ vocatype.t }}</span
            >:
            <span>{{ vocatype.v }}</span>
          </template>
        </div>

        <div class="voca-card-voca-simple" v-if="bookItem?.ps?.length > 0">
          <div>简要解释：</div>
          <div
            class="voca-card-voca-simple-item"
            v-for="vocatype in bookItem.ps"
            :key="vocatype.id"
          >
            <span>{{ vocatype.t }}</span
            >:
            <span>{{ vocatype.p.join(", ") }}</span>
          </div>
        </div>

        <div class="voca-card-voca-complex" v-if="bookItem?.pd?.length > 0">
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
        </div>

        <div class="voca-card-voca-complex" v-if="bookItem?.ph?.length > 0">
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
        </div>

        <div class="voca-card-voca-complex" v-if="bookItem?.sy?.v?.length > 0">
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
        </div>

        <div class="voca-card-voca-complex" v-if="bookItem?.oth?.length > 0">
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
        </div>

        <div class="voca-card-voca-complex" v-if="bookItem?.col?.length > 0">
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
        </div>
      </div>
      <!-- <div class="right">
        <pre>{{ bookItem }}</pre>
      </div> -->
    </div>
  </el-card>

  <SettingCom :visible="drawer" @handleDrawer="handleDrawer" />

  <el-dialog
    v-model="centerDialogVisible"
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
import { reactive, ref, onMounted, computed, toRaw } from "vue";
import {
  ElMessageBox,
  ElNotification,
  ElDescriptions,
  ElDescriptionsItem,
  ElMessage,
} from "element-plus";
import { RouterLink } from "vue-router";
import JDevice from "./Device.vue";
import UploadBook from "./uploadBook.vue";
import SelectBook from "./selectBook.vue";
import { routes } from "../router/index";
import {
  InfoFilled,
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  Setting,
  User,
} from "@element-plus/icons-vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import moment from "moment";

let centerDialogVisible = ref(false)

let fayinList = reactive({});
let useBook = useBookStore();

let { todayStudyVocabulary, currentBook, dbInstance } = storeToRefs(useBook);
// let { getTable } = useBook

const drawer = ref(false);

let bookItem = ref({});

let todayStudyWordsTable = ref();
let todayStudyWords = ref();
let studyTalbe = ref();
let table = ref();
let studyWords = ref([]);
let notStudyWords = ref([]);

let reviewMode = ref(false)

onMounted(async () => {
  todayStudyWordsTable.value = dbInstance.value.getTable("today-studied-voca");

  if (!todayStudyWordsTable.value) {
    await dbInstance.value.addTable("today-studied-voca", "++id");
  }
  todayStudyWordsTable.value = dbInstance.value.getTable("today-studied-voca");

  todayStudyWords.value = await todayStudyWordsTable.value.toArray();
  todayStudyWords.value = todayStudyWords.value.map((word) => word.id);
  todayStudyVocabulary.value = [
    ...new Set(todayStudyVocabulary.value.concat(todayStudyWords.value)),
  ];

  console.log(todayStudyVocabulary.value);

  studyTalbe.value = dbInstance.value.getTable("studied-voca");

  if (!studyTalbe.value) {
    await dbInstance.value.addTable("studied-voca", "++id, n, date");
  }

  studyTalbe.value = dbInstance.value.getTable("studied-voca");
  studyWords.value = await studyTalbe.value.toArray();
  studyWords.value = studyWords.value.map((word) => word.id);
  console.log(studyWords.value.length, "以学习");

  table.value = dbInstance.value.getTable(currentBook.value);

  if (moreThanTodayPlan()) {
    notStudyWords.value = await table.value
      .filter((word) => todayStudyVocabulary.value.includes(word.id))
      .toArray();
  } else {
    notStudyWords.value = await table.value
      .filter((word) => !studyWords.value.includes(word.id))
      .toArray();
  }

  notStudyWords.value = notStudyWords.value.map((word) => word.id);

  if (table.value) {
    getDataTest();
  }
});

function startReviewMode (visible) {
  centerDialogVisible.value = visible
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

const allRoute = ref(routes);

function moreThanTodayPlan() {
  if(reviewMode.value) {
    return true
  }
  if (todayStudyVocabulary.value.length >= 50) {
    startReviewMode(true)
    reviewMode.value = true
    return true;
  }
  return false;
}

async function getDataTest() {
  let count = await table.value.count();
  console.log(count, "数量");

  if (moreThanTodayPlan()) {
    notStudyWords.value = notStudyWords.value.filter((word) =>
      todayStudyVocabulary.value.includes(word)
    );
  } else {
    notStudyWords.value = notStudyWords.value.filter(
      (word) => !todayStudyVocabulary.value.includes(word)
    );
  }

  let random = Math.floor(Math.random() * notStudyWords.value.length);
  bookItem.value = await table.value.get(notStudyWords.value[random]);
  putStudiedVocabulary(toRaw(bookItem.value));
}

async function putStudiedVocabulary(data) {
  let name = "studied-voca";
  let table = dbInstance.value.getTable("studied-voca");
  if (!table) {
    await dbInstance.value.addTable(name, "++id, n, date");
    table = dbInstance.value.getTable("studied-voca");
  }
  let date = moment().format("YYYY-MM-DD");
  console.log(table, "table");
  let putData = {
    id: data.id,
    n: data.n,
    date: date,
  };
  todayStudyVocabulary.value.push(putData.id);
  todayStudyWordsTable.value.put(putData);
  table.put(putData);
}
</script>

<style scoped lang="scss">
.voca {
  &-phonetic-type {
    font-size: 6px;
    margin-left: 1em;
  }
  &-card {
    height: 100%;
    :deep(.el-card__header) {
      background: #35a3c9;
      color: #fff;
      padding: 10px 20px;
    }
    :deep(.el-card__body) {
      height: calc(100% - 53px);
      overflow: auto;
      padding: 10px 20px;
    }
    &-name {
      font-size: 24px;
      // height: 2em;
      // line-height: 2em;
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
      // background-color: bisque !important;
      &:hover {
        background-color: bisque !important;
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
    &-voca-simple {
      padding: 20px 0;
    }
    &-voca-complex {
      padding: 20px 0;
    }
  }
}
</style>
