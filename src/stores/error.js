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
  let errorList = ref();
  let errorListCache = ref([]);
  let errLastTime = ref()

  watch(() => errorList.value, (n, o) => {
    console.log('监听dexie错误', n, o)
    // 此处弹出错误弹框
  })

  function addError(err) {
    // 防止卡死，限制数量
    if (errorList.value && errorList.value.length >= 50) {
      return false
    }
    if (errLastTime.value && Math.abs(errLastTime.value - Date.now()) < 3000) {
      return false
    }
    err = {
      msg: err.message,
      stack: err.stack.toString()

    }
    errorList.value = (errorList.value || []).concat(err);
    errorListCache.value = errorListCache.value.concat(err);
  }

  function clearError() {
    errorList.value = null;
    console.log(errorList.value)
    errLastTime.value = Date.now()

  }

  return {
    errorList,
    errorListCache,
    addError,
    clearError,
  };
});
