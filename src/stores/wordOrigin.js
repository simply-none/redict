import { ref, computed, watch, reactive, unref, toRaw, toRefs, watchEffect } from "vue";
import { defineStore, storeToRefs } from "pinia";

let originInfoKey = 'redict:word-origin-list'

function getoriginInfo(val) {
  let originInfoInStorage = localStorage.getItem(originInfoKey);
  if (!originInfoInStorage) {
    originInfoInStorage = val;
  } else {
    originInfoInStorage = JSON.parse(originInfoInStorage);
  }
  return originInfoInStorage;
}

function setoriginInfo(val) {
  let originInfo = unref(val);
  localStorage.setItem(originInfoKey, JSON.stringify(originInfo));
  return originInfo;
}

// 本store，用处在于获取、设置基础信息数据
export const useWordOriginStore = defineStore("wordOrigin", () => {
  let wordOriginList = reactive([
    {
      name: '必应',
      link: 'https://cn.bing.com/dict/search?q='
    },
    {
      name: '朗文',
      link: 'https://www.ldoceonline.com/dictionary/'
    },
    {
      name: '剑桥',
      link: 'https://dictionary.cambridge.org/dictionary/english-chinese-simplified/'
    },
    {
      name: 'worldreference',
      link: 'https://www.wordreference.com/enzh/'
    }
  ])
  
  let wordOriginLink = ref(getoriginInfo(wordOriginList[0].link))

  wordOriginLink.value = setoriginInfo(wordOriginLink)

  async function updateWordOriginLink(link) {
    wordOriginLink.value = setoriginInfo(link)
  }

  return {
    wordOriginLink,
    wordOriginList,
    updateWordOriginLink
  };
});
