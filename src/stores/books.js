import { ref, computed, watch, reactive, toRaw, toRefs } from "vue";
import { defineStore, storeToRefs } from "pinia";
import useDBStore from "./db";

export const useBookStore = defineStore("book", () => {

  let basicData = reactive({
    currentBook: "",
    currentRange: "",
    studyMode: "",
    studyCount: 0,
    showMode: '',
    showVocabularyItem: ['ps'],
  });

  let basicDataOrigin = reactive({
    currentBook: "",
    currentRange: "",
    studyMode: "",
    studyCount: 0,
    showMode: '',
    showVocabularyItem: [],
  });

  let useDB = useDBStore();
  let { schema, dbChanged } = storeToRefs(useDB);
  let { getTable } = useDB;

  watch(
    () => dbChanged.value,
    async (newV, oldV) => {
      

      

      let tableList = Object.keys(schema.value);
      let basic = tableList.find((l) => l === "basic-info");
      let basicTable = getTable(basic);
      
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
      
    },
    { deep: true, immediate: true }
  );

  async function updateBasicInfo(field, newData) {
    basicData[field] = newData;
    
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
    basicDataOrigin,
    updateBasicInfo,
  };
});
