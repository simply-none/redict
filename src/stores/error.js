import {
  ref,
  computed,
  watch,
  reactive,
  unref,
  toRaw,
  toRefs,
  watchEffect,
} from "vue";
import { defineStore, storeToRefs } from "pinia";

// 本store，用处在于获取、设置基础信息数据
export const useErrorStore = defineStore("error", () => {
  let errorList = ref([]);
  let errorListCache = ref([]);

  watch(() => errorList.value, (n, o) => {
    console.log('监听dexie错误', n, o)
    // 此处弹出错误弹框
  })

  function addError(err) {
    console.log('hhhhh')
    errorList.value = errorList.value.concat(err);
    errorListCache.value = errorList.value.concat(err);
  }

  function clearError() {
    errorList.value = [];
  }

  return {
    errorList,
    errorListCache,
    addError,
    clearError,
  };
});
