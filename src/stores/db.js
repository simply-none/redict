import { ref, computed, watch, reactive, toRaw, unref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { db, dexieErrorTag } from "../utils/createDB";
import { useBookStore } from "./books";

export default defineStore("DB", () => {
  let useBook = useBookStore()
  let { basicData } = storeToRefs(useBook)
  let { updateBasicInfo, getBasicInfo } = useBook

  let dbChanged = ref();
  let verno = ref(db.verno);
  let schema = ref(setSchema(db));

  function isExistSchema() {
    let DBInStanceTables = db.tables;
    console.log(DBInStanceTables, "tables");
    if (DBInStanceTables.length === 0) {
      return 0;
    }
    return DBInStanceTables.length;
  }

  function setSchema(db) {
    let schema = {};
    // 这段代码的作用是：新增或修改数据库表时，不删除原有的表
    db.tables.forEach(function (table) {
      // console.log(table, "table");
      let tableSchema = [table.schema.primKey.src];
      table.schema.indexes.forEach((index) => {
        tableSchema.push(index.src);
      });
      schema[table.name] = tableSchema.join(",");
    });
    return schema;
  }

  function getTable(table) {
    let tables = Object.keys(schema.value);

    if (!tables.includes(table)) {
      return false;
    }
    // console.log(db[table], 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
    
    return db[table];
  }

  async function addTable(tableName, tableSchema) {
    console.log("添加表addTable", tableName, tableSchema);
    verno.value = verno.value + 1;
    await db.close();

    schema.value[tableName] = tableSchema;

    db.version(verno.value).stores(schema.value);
    await db.open();
    dbChanged.value = Date.now();
  }

  return {
    dbChanged,
    getTable,
    schema,
    addTable,
    isExistSchema,
  };
});
