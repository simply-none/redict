<template>
  <div class="left">
    <!-- 音标 -->
    <WordPhonetic :book-item="bookItem" />

    <template v-if="basicData.showVocabularyItem.includes('t')"
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

    <template v-if="basicData.showVocabularyItem.includes('ps')"
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

    <template v-if="basicData.showVocabularyItem.includes('pd')"
      ><div class="voca-card-voca-complex" v-if="bookItem?.pd?.length > 0">
        <div>中英双解：</div>
        <div
          class="voca-card-voca-complex-item"
          v-for="vocatype in bookItem.pd"
          :key="vocatype.id"
        >
          <span class="voca-card-voca-complex-type">{{ vocatype.t }}</span
          >:
          <div v-for="voca in vocatype.p" :key="voca.id">
            <span>{{ voca.zh }}</span>
            <span>【{{ voca.en }}】</span>
          </div>
        </div>
      </div></template
    >

    <template v-if="basicData.showVocabularyItem.includes('ph')"
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

    <template v-if="basicData.showVocabularyItem.includes('sy')"
      ><div class="voca-card-voca-complex" v-if="bookItem?.sy?.v?.length > 0">
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

    <template v-if="basicData.showVocabularyItem.includes('col')"
      ><div class="voca-card-voca-complex" v-if="bookItem?.col?.length > 0">
        <div>词语搭配：</div>
        <div
          class="voca-card-voca-complex-item"
          v-for="(vocatype, index) in bookItem.col"
          :key="vocatype.id"
        >
          <span class="voca-card-voca-complex-type"
            >{{ index + 1 }}. {{ vocatype.t }}</span
          >:
          <div v-for="(voca, subindex) in vocatype.subtype" :key="voca.id">
            <div class="voca-card-voca-complex-type2">
              {{ index + 1 + "." + (subindex + 1) }}. {{ voca.t }}
            </div>
            <div class="voca-card-voca-complex-type3">{{ voca.st }}</div>
            <div v-for="stl in voca.stl" :key="stl.id">
              {{ stl }}
            </div>
          </div>
        </div>
      </div></template
    >
  </div>
</template>

<script setup>
import { ref, reactive, watchEffect, watch } from "vue";
import WordPhonetic from "./wordPhonetic.vue";

defineProps({
  basicData: {
    type: Object,
  },
  bookItem: {
    type: Object,
  },
});
</script>

<style scoped lang="scss">
.left {
  width: 100%;
}
.voca-card {
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
</style>
