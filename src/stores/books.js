import { ref, computed, watch, reactive, toRaw, toRefs } from "vue";
import { defineStore, storeToRefs } from "pinia";
import useDBStore from "./db";

export const useBookStore = defineStore("book", () => {
  // let currentBook = ref("");
  // let currentRange = ref("");

  // let studyMode = ref("");

  // let studyCount = ref(0);

  // let showVocabularyItem = ref([]);

  let todayStudyVocabulary = ref([]);

  let basicData = reactive({
    currentBook: "",
    currentRange: "",
    studyMode: "",
    studyCount: 0,
    showVocabularyItem: [],
  });

  let useDB = useDBStore();
  let { schema, dbChanged } = storeToRefs(useDB);
  let { getTable } = useDB;

  watch(
    () => dbChanged.value,
    async (newV, oldV) => {
      console.log(newV, oldV, Date.now(), "版本变更");

      console.log(schema, "console");

      let tableList = Object.keys(schema.value);
      let basic = tableList.find((l) => l === "basic-info");
      let basicTable = getTable(basic);
      console.log(tableList, basicTable, "basicTable");
      if (!basicTable) {
        return false;
      }

      let basicInfo = (await basicTable.get(1));

      if (!basicInfo) {
        basicData.name = '基础数据'
        return false
      }


      Object.keys(basicInfo).forEach((field) => {
        basicData[field] = toRaw(basicInfo[field]);
      });
      console.log(basicData);
    },
    { deep: true, immediate: true }
  );

  async function updateBasicInfo(field, newData) {
    basicData[field] = newData;
    console.log(basicData);
    let tableList = Object.keys(schema.value);
    let basic = tableList.find((l) => l === "basic-info");
    let basicTable = getTable(basic);
    let basicInfo = await basicTable.get(1);
    basicTable.put({
      ...basicInfo,
      id: 1,
      name: "基础数据",
      [field]: toRaw(newData),
    });
  }

  return {
    basicData,
    updateBasicInfo,
    todayStudyVocabulary,
  };
});
