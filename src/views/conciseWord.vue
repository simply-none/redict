<template>
  <div class="left">
    <!-- 音标 -->

    <div class="voca-card-voca-explain">
      <WordPhonetic :book-item="bookItem" class="voca-card-voca-concise-word"/>

      <span class="voca-card-voca-explain-item" v-for="(exp, index) in explain" :key="exp + index">
        {{ exp }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watchEffect, watch, computed, unref, toRaw } from "vue";
import WordPhonetic from "./wordPhonetic.vue";

let props = defineProps({
  basicData: {
    type: Object
  },
  bookItem: {
    type: Object,
    default: () => {}
  }
})

let explain = computed(() => {
  return getExplain(unref(props.bookItem))
})

function getExplain (word) {
  
  if (!word) {
    return []
  }
  let ps = word.ps || []
  let pd = word.pd || []

  ps = ps.reduce((pre, cur)=> {
    return getExplainSet(pre, cur.p)
  }, [])

  pd = pd.reduce((pre, cur)=> {
    let innerArr = (cur.p || []).map(item => item.zh)
    return getExplainSet(pre, innerArr)
  }, [])

  let explain = ps.concat(pd)
  return explain
}

function getExplainSet (totalSet, curSet) {
  let arr = (curSet || []).join('，')
  arr = arr.replace(/，|；/g, ',')
  arr = arr.split(',')
  let pre = [...new Set(totalSet.concat(arr))]
  pre = pre.map(p => {
    // 删除单词前面的词性
    return p.replace(/^([A-Za-z]+\.\s(&\s)?)*/, '')
  })
  return pre
}

</script>

<style scoped lang="scss">
.left {
  user-select: none;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.voca-card {
  &-voca-concise-word {
    width: 100%;
    text-align: center;
  }
  &-voca-explain {
    overflow: auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    &-item {
      // display: inline-block;
      font-weight: 600;
      font-size: 1.2em;
      color: #999;
      &:not(:last-child)::after {
          content: '，';
          padding-right: 3px;
        }
    }
  }
}
</style>
