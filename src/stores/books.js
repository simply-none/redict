import { ref, computed, watch, reactive, toRaw } from "vue";
import { defineStore } from "pinia";

export const useBookStore = defineStore("book", () => {
  let books = ref([]);
  let currentBook = ref("");
  let currentRange = ref("");
  let dbInstance = ref({});

  let studyMode = ref("");

  let studyCount = ref(0);

  let showVocabularyItem = ref([]);

  let todayStudyVocabulary = ref([]);


  watch(
    () => dbInstance.value,
    async (newV, oldV) => {
      let newVKeys = Object.keys(newV);
      if (!newVKeys.length) {
        return false;
      }

      let tableList = Object.keys(newV.schema);
      let basic = tableList.find((l) => l === "basic-info");
      let basicTable = newV.getTable(basic);
      if (!basicTable) {
        return false;
      }

      if (basicTable) {
        let basicInfo = await basicTable.get(1);

        currentBook.value = basicInfo?.currentBook ?? "";
        currentRange.value = basicInfo?.currentRange ?? "";
        showVocabularyItem.value = basicInfo?.showVocabularyItem ?? [];
        studyMode.value = basicInfo?.studyMode ?? "";
        studyCount.value = basicInfo?.studyCount ?? 0;
      }
    },
    { deep: true }
  );

  function updateDbInstance(newData) {
    dbInstance.value = reactive(newData);
  }

  function updateBooks(newData) {
    books.value = newData;
  }

  async function updateCurrentBook(newData) {
    currentBook.value = newData;
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = dbInstance.value.getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "测试",
      currentBook: currentBook.value,
    });
  }

  async function updateCurrentRange(newData) {
    currentRange.value = newData;
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = dbInstance.value.getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "测试",
      currentRange: currentRange.value,
    });
  }

  async function updateStudyCount(newData) {
    studyCount.value = newData;
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = dbInstance.value.getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "测试",
      studyCount: studyCount.value,
    });
  }

  async function updateStudyMode(newData) {
    studyMode.value = newData;
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = dbInstance.value.getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "测试",
      studyMode: studyMode.value,
    });
  }

  async function updateShowVocabularyItem(newData) {
    showVocabularyItem.value = newData;
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = dbInstance.value.getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "测试",
      showVocabularyItem: toRaw(showVocabularyItem.value),
    });
  }

  async function updateBasicInfo(val) {
    let tableList = Object.keys(dbInstance.value.schema);
    let basic = tableList.find((l) => l === "basic-info");
      let basicTable = dbInstance.value.getTable(basic);
      if (!basicTable) {
        return false
      }
    let basicInfo = await basicTable.get(1);

    currentBook.value = basicInfo?.currentBook ?? "";
    currentRange.value = basicInfo?.currentRange ?? "";
    showVocabularyItem.value = basicInfo?.showVocabularyItem ?? [];
    studyMode.value = basicInfo?.studyMode ?? "";
    studyCount.value = basicInfo?.studyCount ?? 0;
  }

  return {
    updateBasicInfo,
    todayStudyVocabulary,
    currentBook,
    currentRange,
    showVocabularyItem,
    studyMode,
    studyCount,
    updateStudyCount,
    dbInstance,
    books,
    updateBooks,
    updateCurrentBook,
    updateCurrentRange,
    updateStudyMode,
    updateShowVocabularyItem,
    updateDbInstance,
  };
});
