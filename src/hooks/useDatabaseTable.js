import { ref, reactive, watch, onMounted, computed } from 'vue'

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

export function useDatabaseTable() {
  let useBook = useBookStore();

  let { dbInstance } = storeToRefs(useBook);

  let databaseTableList = reactive({})

  // 获取数据表，无则创建表
  async function getDatabaseTable(tableName, tableSchema) {
    if (databaseTableList[tableName]) {
      console.log('创建过这个表吗？', tableName)
      return databaseTableList[tableName]
    }
    let loadTable = dbInstance.value.getTable(tableName)
    if (!loadTable) {
      await dbInstance.value.addTable(tableName, tableSchema)
      loadTable = dbInstance.value.getTable(tableName)
    }
    console.log(loadTable, '加载table')
    databaseTableList[tableName] = loadTable
    return loadTable
  }

  return {
    databaseTableList,
    getDatabaseTable,
  }
}
