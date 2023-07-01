import { ref, computed, watch, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useBookStore = defineStore('book', () => {
  let books = ref([])
  let currentBook = ref('')
  let dbInstance = ref({})

  let todayStudyVocabulary = ref([])


  watch(() => dbInstance.value, async (newV, oldV) => {
    let tableList = Object.keys(newV.schema)
    let basic = tableList.find(l => l === 'basic-info')
    let basicTable = newV.getTable(basic)
    if (basicTable) {
      let basicInfo = await basicTable.get(1)
      currentBook.value = basicInfo?.currentBook??''
      console.log(basicInfo)
    }
    console.log(newV.schema, 1, basicTable)
  }, {deep: true})

  function updateDbInstance(newData) {
    dbInstance.value = reactive(newData)

    

  }

  let getTable = ref()
  let schema = ref()
  let addTable  = ref()
  let db = ref()


  
  function updateBooks(newData) {
    books.value = newData
    console.log('更新', books.value)
  }

  function updateCurrentBook(newData) {
    currentBook.value = newData
    let tableList = Object.keys(dbInstance.value.schema)
    let basic = tableList.find(l => l === 'basic-info')
    let basicTable = dbInstance.value.getTable(basic)
    basicTable.put({
      id: 1,
      name: '测试',
      currentBook: currentBook.value
    })
    console.log('更新', currentBook.value)
  }

  return { todayStudyVocabulary, currentBook, dbInstance, books, updateBooks, updateCurrentBook, updateDbInstance }
})
