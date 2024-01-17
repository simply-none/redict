import { ref, computed, watch, reactive, toRaw, unref } from "vue";
import { defineStore, storeToRefs } from "pinia";

import useDBStore from "../stores/db";

import { isArray } from "../utils/common";

export default defineStore("DBTable", () => {

  let tableSet = reactive({})

  let useDB = useDBStore();

  let { getTable, addTable } = useDB;

  async function getTypeData(table, update) {
    let unrefTable = unref(table);
    let data = getTableSet(unrefTable.name, "data");
    if (!data || update) {
      
      data = await unrefTable.toArray();
      
      updateTableSet("data", unrefTable.name, data);
    }
    return data;
  }

  async function getTypeFilterData(table, filter, update) {
    let words = await getTypeData(table, update);
    return words.map((word) => {
      if (!isArray(filter)) {
        return word;
      }
      if (filter.length === 1) {
        return word[filter[0]];
      }
      return filter.reduce((pre, cur) => {
        pre[cur] = word[cur];
        return pre;
      }, {});
    });
  }

  // 获取数据表，无则创建表
  async function getDBTable(tableName, tableSchema) {
    let loadTable = getTable(tableName);
    console.log(loadTable, !!loadTable)
    if (!loadTable && tableSchema) {
      await addTable(tableName, tableSchema);
      loadTable = getTable(tableName);
    }

    return loadTable;
  }

  async function getDBTableData(table, filter = false, update = false) {
    if (filter) {
      return await getTypeFilterData(table, filter, update);
    }
    return await getTypeData(table, update);
  }

  function updateTableSet (type, tableName, value) {
    if (!tableSet[tableName]) {
      tableSet[tableName] = {}
    }
    tableSet[tableName][type] = value
  }

  function getTableSet (tableName, type) {
    if (!tableSet[[tableName]]) {
      tableSet[tableName] = {}
    }
    return tableSet[tableName][type]
  }

  return {
    tableSet,
    updateTableSet,
    getTableSet,
    getDBTable,
    getDBTableData
  };
});
