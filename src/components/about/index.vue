<script setup>
import { reactive, ref, computed, watch, onMounted } from "vue";
import packagepath from "../../../package.json";
import cidian from "./词典简单.json";
import { ElNotification, ElButton } from "element-plus";

import { Switch, Headset } from "@element-plus/icons-vue";

import defaultDict from "./defaultDict.json?raw";
import useDB from "./useDB";

const { words, db, createTable } = useDB("dict-database");

onMounted(async () => {});

const emit = defineEmits(["desc"]);

const patx = "../../dictionary.cambridge.org/json/**.json";

const paty = "../../wordreference.com/json/**.json";

let moduleDefault = ref([]);

let moduleRandom = ref(Math.floor(Math.random() * 1000000000));

let moduleLength = computed(() => moduleDefault.value.length);
let modulesG = ref();

let currentModule = ref({
  name: "",
  value: [],
});
const pageDate = reactive({ info: {}, dependencies: {}, devDependencies: {} });

let fayinList = reactive({});
let examClass = ref("");
let showBottomColor = computed(() =>
  examClass.value ? "" : "showBottomColor"
);

let citiaoInnerRef = ref();
Object.entries(JSON.parse(defaultDict)).forEach((word, index) => {
  // console.log(word, 'word')
  words.add({
    name: word[0],
    value: word[1],
  });
  moduleDefault.value.push({
    name: word[0] || '单词未找到',
    value: word[1] || [],
  });
  if (index === defaultDict.length - 1) {
    toggoleCihui();
    console.log('进来')
  }
  console.log('进来')
});

function toggoleCihui(e) {
  const random = Math.floor(Math.random() * 1000000000);
  let value =
    random > moduleLength.value
      ? random % moduleLength.value
      : Math.floor(random);

  let cannedClickContainerWidth = citiaoInnerRef.value?.clientWidth;
  if (e) {
    // createTable(Date.now().toString());

    const currentClickPositionX = e.clientX;
    console.log(currentClickPositionX, cannedClickContainerWidth);
    if (currentClickPositionX < cannedClickContainerWidth / 2) {
      console.log("点击的左边");
    } else {
      console.log("点击的右边");
    }
    moduleRandom.value = value;
    return true;
  }
  moduleRandom.value = value;
}

watch(moduleRandom, (n, o) => {
  const index =
    moduleRandom.value > n
      ? moduleRandom.value % n
      : Math.floor(moduleRandom.value);
  currentModule.value = moduleDefault.value[index];

  console.log(currentModule.value, 'v')
});

pageDate.info = {
  name: packagepath.name,
  version: packagepath.version,
};
pageDate.dependencies = packagepath.dependencies;
pageDate.devDependencies = packagepath.devDependencies;

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

function openExample() {
  examClass.value = !examClass.value ? "showExample" : "";
}
</script>

<template>
  <el-row :gutter="30" class="enter-y">
    <el-col class="enter-left">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span class="card-header-name">{{ currentModule.name }}</span>
            <div>
              <ElButton
                type="warning"
                plain
                class="card-header-setting"
                @click.stop="openExample"
              >
                {{ (examClass ? "展示" : "隐藏") + "示例" }}
              </ElButton>
              <el-button
                type="warning"
                plain
                :icon="Switch"
                circle
                @click="toggoleCihui"
              />
            </div>
          </div>
        </template>
        <!-- {{ currentModule }} -->
        <div @click="toggoleCihui" class="citiao_inner" ref="citiaoInnerRef">
          <div
            class="citiao"
            v-for="(m, lv1) in currentModule.value"
            :key="m.id"
          >
            <!-- {{ currentModule }} -->
            <div class="citiao_header">
              <div class="citiao_name" v-if="m.name">{{ m.name }}</div>
              <div class="citiao_pos" :title="m.posTip">{{ m.pos }}</div>
              <div class="citiao_pron">
                <div
                  v-for="[uk, so] in Object.entries(m.pronunciation || {})"
                  :key="so.id"
                  class="citiao_pron_item"
                >
                  <div class="citiao_pron_item_fayin">
                    <el-icon>
                      <Headset />
                    </el-icon>
                    <div @click.stop="getFayin(uk)">
                      {{ uk }}: {{ so.phonetic }}
                    </div>
                    <audio
                      preload="none"
                      :key="Date.now()"
                      :ref="(el) => (fayinList[uk] = el)"
                    >
                      <template v-for="source in so.source" :key="source.id">
                        <source
                          :title="
                            'https://dictionary.cambridge.org' + source.src
                          "
                          :type="source.type"
                          :src="'https://dictionary.cambridge.org' + source.src"
                        />
                      </template>
                      <!-- 如果浏览器不支持，则会呈现下面内容 -->
                      <p>
                        你的浏览器不支持HTML5音频，你可以<a href="audiofile.mp3"
                          >下载</a
                        >这个音频文件。
                      </p>
                    </audio>
                  </div>
                </div>
              </div>
            </div>

            <template v-for="(dsense, lv2) in m.dsense" :key="dsense.id">
              <div class="citiao_dsense" v-if="dsense">
                <div
                  class="citiao_trans_ex"
                  v-for="(trans, lv3) in dsense.trans_examp"
                  :key="trans.id"
                >
                  <div class="citiao_trans_ex_h">
                    <div class="citiao_trans_ex_num" :class="showBottomColor">
                      {{ lv1 + 1 + "." + (lv2 + 1) + "." + (lv3 + 1) }}.&nbsp;
                    </div>
                    <div
                      class="citiao_trans_ex_name"
                      :class="showBottomColor"
                      v-if="dsense.name && m.name !== dsense.name"
                      :title="dsense.guideword"
                    >
                      {{ dsense.name }}
                    </div>
                    <div
                      class="citiao_trans_desc"
                      :class="showBottomColor"
                      :title="'英文说明：' + trans.trans_en"
                    >
                      <div v-if="dsense.pos" class="citiao_trans_pos">
                        {{ dsense.pos + " " }}
                      </div>
                      <div v-if="trans.level" class="citiao_trans_level">
                        {{ trans.level + " " }}
                      </div>
                      <div v-if="trans.pos_2" class="citiao_trans_pos_2">
                        {{ trans.pos_2 + " " }}
                      </div>
                      <div v-if="trans.trans_cn" class="citiao_trans_cn">
                        {{ trans.trans_cn }}
                      </div>
                    </div>

                    <div
                      v-if="dsense.guideword"
                      class="citiao_trans_guide"
                      :class="showBottomColor"
                      :title="'指导：' + dsense.guideword"
                    >
                      [简]]{{ dsense.guideword }}
                    </div>
                  </div>
                  <div></div>
                  <div
                    style="overflow: hidden"
                    class="citiao_exam"
                    :class="examClass"
                  >
                    <div
                      class="citiao_exam_item"
                      v-for="(example, lv4) in trans.example"
                      :key="example.id"
                    >
                      <div class="citiao_exam_eg">
                        <span>- </span>
                        <span>{{ example.eg }}</span>
                      </div>
                      <div class="citiao_exam_trans">
                        &nbsp; {{ example.egtrans }}
                      </div>
                      <!-- <hr /> -->
                    </div>
                  </div>
                </div>

                <!-------------------- phrase------------------ -->

                <div
                  class="citiao_trans_ex"
                  v-for="(trans, lv3) in dsense.phrase"
                  :key="trans.id"
                >
                  <div class="citiao_trans_ex_h">
                    <div class="citiao_trans_ex_num" :class="showBottomColor">
                      {{ lv1 + 1 + "." + (lv2 + 1) + "." + (lv3 + 1) }}.&nbsp;
                    </div>
                    <template
                      class="citiao_trans_desclist"
                      v-for="(block, lv4) in trans.dsense_body_def_block_kk"
                    >
                      <div
                        class="citiao_trans_desc"
                        :class="showBottomColor"
                        :title="'英文说明：' + block.def"
                      >
                        <div v-if="dsense.pos" class="citiao_trans_pos">
                          {{ dsense.pos + " " }}
                        </div>
                        <div
                          v-if="block.def_info.epp_xref"
                          class="citiao_trans_level"
                        >
                          {{ block.def_info.epp_xref + " " }}
                        </div>
                        <div
                          v-if="block.def_info.gram"
                          class="citiao_trans_pos_2"
                        >
                          {{ block.def_info.gram + " " }}
                        </div>
                        <div v-if="block.ddef_b_trans" class="citiao_trans_cn">
                          {{ block.ddef_b_trans }}
                        </div>
                      </div>

                      <div
                        v-if="dsense.guideword"
                        class="citiao_trans_guide"
                        :class="showBottomColor"
                        :title="'指导：' + dsense.guideword"
                      >
                        [简]]{{ dsense.guideword }}
                      </div>

                      <div
                        style="overflow: hidden"
                        class="citiao_exam"
                        :class="examClass"
                      >
                        <div
                          class="citiao_exam_item"
                          v-for="(example, lv4) in block.example"
                          :key="example.id"
                        >
                          <div class="citiao_exam_eg">
                            <span>- </span>
                            <span>{{ example.eg }}</span>
                          </div>
                          <div class="citiao_exam_trans">
                            &nbsp; {{ example.egtrans }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.enter-y {
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
.enter-left {
  width: 50%;
  max-width: 760px;
  height: 100%;
  padding: 0 !important;
  // margin: 1em !important;
}

.box-card {
  height: 100%;
  :deep(.el-card__body) {
    height: calc(100% - 55px);
    padding: 0;
    overflow: auto;
    &::-webkit-scrollbar {
      /*隐藏滚轮*/
      display: none;
    }
  }
}
.showExample {
  height: 0;
}

:deep(.el-card__header) {
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}

.card-header {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  &-name {
    font-size: 1.6em;
    font-weight: 900;
    color: #35a3c9;
  }
  &-setting {
    text-align: right;
    display: inline-block;
    padding: 0 1em;
    cursor: pointer;
    &:hover {
      color: #35a3c9;
    }
  }
}
.citiao {
  border: 3px solid #35a3c9;
  border-top: none;
  & + & {
    margin-top: 1em;
  }

  &_inner {
    height: 100%;
    padding: 20px;
  }
  &_header {
    background: #35a3c9;
    color: #fff;
  }

  &_header,
  &_dsense {
    padding: 0 1em;
  }

  &_name {
    font-size: 1.2em;
    font-weight: 600;
    display: inline-block;

    height: 2.5em;
    line-height: 2.5em;
  }
  &_pos,
  &_pron {
    margin-left: 1em;
    font-size: 0.8em;
    font-weight: 100;
    display: inline-block;
  }
  &_pron {
    &_item {
      display: inline-block;
      cursor: pointer;
      & + & {
        margin-left: 1em;
      }
      &_fayin {
        display: inline-flex;
        align-items: center;
        .el-icon {
          font-weight: 900;
        }
      }
    }
  }

  &_dsense {
    &:nth-child(odd) {
      background-color: #f8f8f8;
    }
    &:nth-child(even) {
      background-color: #fff;
    }
    & + & {
      padding-top: 6px;
    }
  }
  &_trans {
    &_ex_h {
    }
    &_ex_name,
    &_ex_num,
    &_desc,
    &_guide {
      &.showBottomColor {
        border-bottom: 5px solid #ffe08b;
      }
    }
    &_ex_name {
      padding-right: 1em;
    }
    &_desc {
      div + div {
        padding-left: 0.5em;
      }
    }
    &_ex_num,
    &_ex_name,
    &_desc,
    &_pos,
    &_level,
    &_pos_2,
    &_cn,
    &_guide {
      display: inline-block;
    }

    &_guide {
      padding-left: 1em;
      color: #949494;
    }
  }

  &_exam {
    padding: 0.2em 0;
  }
}
</style>
