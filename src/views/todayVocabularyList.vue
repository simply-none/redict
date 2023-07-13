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
          <div class="left">
            <!-- 音标 -->
            <div class="voca-card-voca-phonetic">
              <template v-for="phonetic in bookItem.p" :key="phonetic.id">
                <span class="voca-card-voca-phonetic-item">{{
                  phonetic.t
                }}</span>
                <span class="voca-card-voca-phonetic-item">{{
                  phonetic.p
                }}</span>
              </template>
            </div>

            <template v-if="basicData.showVocabularyItem.includes('t')"
              ><div class="voca-card-voca-type" v-if="bookItem?.t?.length > 0">
                <template
                  v-for="vocatype in bookItem.t"
                  :key="vocatype.id"
                >
                  <span>{{ vocatype.t }}</span
                  >:
                  <span>{{ vocatype.v }}</span>
                </template>
              </div></template
            >

            <template v-if="basicData.showVocabularyItem.includes('ps')"
              ><div
                class="voca-card-voca-complex"
                v-if="bookItem?.ps?.length > 0"
              >
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

            <template v-if="basicData.showVocabularyItem.includes('pd')"
              ><div
                class="voca-card-voca-complex"
                v-if="bookItem?.pd?.length > 0"
              >
                <div>中英双解：</div>
                <div
                  class="voca-card-voca-complex-item"
                  v-for="vocatype in bookItem.pd"
                  :key="vocatype.id"
                >
                  <span class="voca-card-voca-complex-type">{{
                    vocatype.t
                  }}</span
                  >:
                  <div v-for="voca in vocatype.p" :key="voca.id">
                    <span>{{ voca.zh }}</span>
                    <span>【{{ voca.en }}】</span>
                  </div>
                </div>
              </div></template
            >

            <template v-if="basicData.showVocabularyItem.includes('ph')"
              ><div
                class="voca-card-voca-complex"
                v-if="bookItem?.ph?.length > 0"
              >
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

            <template v-if="basicData.showVocabularyItem.includes('sy')"
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

            <template v-if="basicData.showVocabularyItem.includes('oth')"
              ><div
                class="voca-card-voca-complex"
                v-if="bookItem?.oth?.length > 0"
              >
                <div>相关词汇：</div>
                <div
                  class="voca-card-voca-complex-item"
                  v-for="vocatype in bookItem.oth"
                  :key="vocatype.id"
                >
                  <span>{{ vocatype.title }}</span
                  >:
                  <template v-for="voca in vocatype.vocabulary" :key="voca.id">
                    <el-link target="_blank" :href="voca.u"
                      >{{ voca.v }},
                    </el-link>
                  </template>
                </div>
              </div></template
            >

            <template v-if="basicData.showVocabularyItem.includes('col')"
              ><div
                class="voca-card-voca-complex"
                v-if="bookItem?.col?.length > 0"
              >
                <div>词语搭配：</div>
                <div
                  class="voca-card-voca-complex-item"
                  v-for="(vocatype, index) in bookItem.col"
                  :key="vocatype.id"
                >
                  <span class="voca-card-voca-complex-type"
                    >{{ index + 1 }}. {{ vocatype.t }}</span
                  >:
                  <div
                    v-for="(voca, subindex) in vocatype.subtype"
                    :key="voca.id"
                  >
                    <div class="voca-card-voca-complex-type2">
                      {{ index + 1 + "." + (subindex + 1) }}. {{ voca.t }}
                    </div>
                    <div class="voca-card-voca-complex-type3">
                      {{ voca.st }}
                    </div>
                    <div v-for="stl in voca.stl" :key="stl.id">
                      {{ stl }}
                    </div>
                  </div>
                </div>
              </div></template
            >
          </div>
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
import useDBStore from '../stores/db'
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted } from "vue";

import { useRoute, useRouter } from "vue-router";

import { generateImage } from "../utils/generateFile";

import moment from "moment";
let useBook = useBookStore();
let useDB = useDBStore()

let {
  basicData,
} = storeToRefs(useBook);
let {
    getTable,
  } = useDB

let router = useRouter();

let divRef = ref(null);

let bookItemList = ref([]);

let vocalist = ref([]);
let historyVocalist = ref([]);
let bookData = ref([]);
let rangeData = ref([]);

getBookRangeData();

function backToMainPage() {
  router.push({ name: "test" });
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

:deep(.el-affix) {
  width: 100% !important;
  &>div {
    width: 100% !important;
  }
}
</style>
