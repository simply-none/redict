import { ref, computed, watch, reactive, toRaw, toRefs } from "vue";
import { defineStore, storeToRefs } from "pinia";
import useDBStore from "./db";

function getBasicInfo () {
  let basicInfoInStorage = localStorage.getItem('basic-info')
    if (!basicInfoInStorage) {
      basicInfoInStorage = {name: '基础数据'}
    } else {
      basicInfoInStorage = JSON.parse(basicInfoInStorage)
    }
    return basicInfoInStorage
}

function setBasicInfo (key, data) {
  let basicInfo = getBasicInfo()
  basicInfo = {
    ...basicInfo,
    id: 1,
    name: '基础数据',
    [key]: toRaw(data)
  }
  localStorage.setItem('basic-info', JSON.stringify(basicInfo))
}

export const useBookStore = defineStore("book", () => {

  let basicData = reactive({
    name: '',
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
  let { getTable, isExistSchema } = useDB;

  watch(
    () => dbChanged.value,
    async (newV, oldV) => {
      
      console.log('改变')

      let a = await isExistSchema()
      console.log(a, 'a')

      if (!a) {
        basicData.name = '基础数据'
        localStorage.setItem('basic-info', JSON.stringify({}))
        console.log('books')
        return false
      }
      

      let tableList = Object.keys(schema.value);
      let basic = tableList.find((l) => l === "basic-info");
      // let basicTable = getTable(basic);
      
      // if (!basicTable) {
      //   return false;
      // }

      // let basicInfo = (await basicTable.get(1));

      let basicInfo = getBasicInfo()

      console.log(basicInfo, 'info')

      if (!basicInfo) {
        basicData.name = '基础数据'
        return false
      }


      Object.keys(basicInfo).forEach((field) => {
        basicData[field] = toRaw(basicInfo[field]);
      });
      console.log(basicData, 'console.log')
    },
    { deep: true, immediate: true }
  );

  async function updateBasicInfo(field, newData) {
    basicData[field] = newData;
    
    // let tableList = Object.keys(schema.value);
    // let basic = tableList.find((l) => l === "basic-info");
    // let basicTable = getTable(basic);
    // let basicInfo = await basicTable.get(1);
    // basicTable.put({
    //   ...basicInfo,
    //   id: 1,
    //   name: "基础数据",
    //   [field]: toRaw(newData),
    // });

    setBasicInfo(field, newData)
  }

  return {
    basicData,
    basicDataOrigin,
    updateBasicInfo,
  };
});
