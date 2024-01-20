import { ref, computed, watch, reactive, unref, toRaw, toRefs, watchEffect } from "vue";
import { defineStore, storeToRefs } from "pinia";


// 当前应用基础数据
let basicInfo = {
  name: "基础数据",
  currentBook: "",
  currentRange: "",
  studyMode: "study",
  studyCount: 10,
  showMode: "concise",
  showVocabularyItem: ["ps"],
  toggleWordWay: 'button'
};

let basicInfoKey = 'redict:basic-info'

export function removeBasicInfo() {
  localStorage.removeItem(basicInfoKey)
}

function getBasicInfo() {
  let basicInfoInStorage = localStorage.getItem(basicInfoKey);
  if (!basicInfoInStorage) {
    basicInfoInStorage = basicInfo;
  } else {
    basicInfoInStorage = JSON.parse(basicInfoInStorage);
  }
  return basicInfoInStorage;
}

function setBasicInfo(origin, key, data) {
  let basicInfo = unref(origin);
  if (!key) {
    basicInfo = {
      ...basicInfo,
      [key]: toRaw(data),
    };
  }

  console.log(JSON.stringify(basicInfo), "hhhh");
  localStorage.setItem(basicInfoKey, JSON.stringify(basicInfo));
  return basicInfo;
}

// 本store，用处在于获取、设置基础信息数据
export const useBookStore = defineStore("book", () => {
  // ❌delete-start：适应性工作，删除之前basic-
  localStorage.removeItem('basic-info')
  // ❌delete-end：适应性工作，删除之前basic-info

  // 先获取
  let basicData = ref(getBasicInfo());
  // 再存储
  basicData.value = setBasicInfo(basicData);

  console.log(basicData.value, "basicData");

  async function updateBasicInfo(field, newData) {
    console.log('更新basicData book')
    basicData.value = setBasicInfo(basicData, field, newData);
  }

  return {
    basicData,
    getBasicInfo,
    updateBasicInfo,
  };
});
