import { ref, computed, watch, reactive, toRaw, unref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import Dexie from "dexie";

import { isEqualObj } from "../utils/common";

export default defineStore("DB", () => {
  let DBInStance = ref();
  let verno = ref(1);
  let schema = ref({});

  let dbChanged = ref(Date.now())

  /**
   * @description 创建数据库及数据库表
   * @param {string} databaseName 数据库名称
   * @param {{name: string, schema: string}[]} initTableStore 初始化的数据库表模式，可为空（第一次创建时应该设置值）
   * @returns
   */
  function createDB(databaseName, initTableStore) {
    let dbName = unref(databaseName);
    DBInStance.value = new Dexie(dbName);
    Dexie.exists(dbName).then((exists) => {
      if (!exists) {
        DBInStance.value = new Dexie(dbName);
        if (initTableStore) {
          initTableStore.forEach((table) => {
            schema.value[table.name] = table.schema;
          });
        }
        DBInStance.value.version(verno.value).stores(schema.value);
        DBInStance.value.open();
        dbChanged.value = Date.now()
        return false;
      }

      DBInStance.value.open()
        .then(() => {
          verno.value = DBInStance.value.verno || 1;

          // 这段代码的作用是：新增或修改数据库表时，不删除原有的表
          DBInStance.value.tables.forEach(function (table) {
            let tableSchema = [table.schema.primKey.src];
            table.schema.indexes.forEach((index) => {
              tableSchema.push(index.src);
            });
            schema.value[table.name] = tableSchema;
          });

          let before = JSON.parse(JSON.stringify(schema.value));

          if (initTableStore) {
            initTableStore.forEach((table) => {
              schema.value[table.name] = table.schema.replace(/\s/g, "").split(",");
            });
          }

          let after = JSON.parse(JSON.stringify(schema.value));

          // 比较添加前后的schema是否相同，若不同，则更新版本号
          let isEqualObjInThis = isEqualObj(before, after);

          if (!isEqualObjInThis) {
            verno.value = verno.value + 1;
          }

          Object.keys(schema.value).forEach((name) => {
            schema.value[name] = schema.value[name].join(",");
          });

          // 在stores之前是获取不到相关的table的，undefined
          // 

          DBInStance.value.close();
          // 关闭数据库后才能新增表
          DBInStance.value.version(verno.value).stores(schema.value);

          // 打开数据库，后续才能对数据库进行curd
          DBInStance.value.open();
          dbChanged.value = Date.now()

          // 
        })
        .catch((e) => {
          
        });
    });
  }

  function getTable(table) {
    let tables = Object.keys(schema.value);
    if (!tables.includes(table)) {
      return false;
    }
    return DBInStance.value[table];
  }

  async function addTable(tableName, tableSchema) {
    verno.value = verno.value + 1;
    await DBInStance.value.close();

    schema.value[tableName] = tableSchema;

    DBInStance.value.version(verno.value).stores(schema.value);

    await DBInStance.value.open();
    dbChanged.value = Date.now()
  }

  return {
    dbChanged,
    DBInStance,
    createDB,
    getTable,
    schema,
    addTable,
  };
});
