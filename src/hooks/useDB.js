import Dexie from "dexie";
import { reactive, ref, watch, toRaw, unref } from "vue";

import { useBookStore } from "../stores/books";
import { storeToRefs } from "pinia";

import isEqualObj from "../utils/isEqualObj";

/**
 * @description 创建数据库及数据库表
 * @param {string} databaseName 数据库名称
 * @param {{name: string, schema: string}[]} initTableStore 初始化的数据库表模式，可为空（第一次创建时应该设置值）
 * @returns 
 */
function createDB(databaseName, initTableStore) {
  let dbName = unref(databaseName);
  let db = new Dexie(dbName);
  let verno = ref(1);
  let schema = reactive({});
  let tables = reactive({});

  const { updateBooks } = useBookStore();
  const { books } = storeToRefs(useBookStore());

  watch(
    () => schema,
    (newV, oldV) => {
      books.value = newV;
    },
    {
      deep: true,
    }
  );

  Dexie.exists(dbName).then((exists) => {
    if (!exists) {
      db = new Dexie(dbName);
      if (initTableStore) {
        initTableStore.forEach((table) => {
          schema[table.name] = table.schema;
        });
      }
      db.version(verno.value).stores(schema);
      db.open();
      return false;
    }

    db.open()
      .then(() => {
        verno.value = db.verno || 1;

        // 这段代码的作用是：新增或修改数据库表时，不删除原有的表
        db.tables.forEach(function (table) {
          let tableSchema = [table.schema.primKey.src];
          table.schema.indexes.forEach((index) => {
            tableSchema.push(index.src);
          });
          schema[table.name] = tableSchema;
        });

        let before = JSON.parse(JSON.stringify(schema));

        if (initTableStore) {
          initTableStore.forEach((table) => {
            schema[table.name] = table.schema.replace(/\s/g, "").split(",");
          });
        }

        let after = JSON.parse(JSON.stringify(schema));

        // 比较添加前后的schema是否相同，若不同，则更新版本号
        let isEqualObjInThis = isEqualObj(before, after);

        if (!isEqualObjInThis) {
          verno.value = verno.value + 1;
        }

        Object.keys(schema).forEach((name) => {
          schema[name] = schema[name].join(",");
        });

        // 在stores之前是获取不到相关的table的，undefined
        // console.log(db.test1688135539713, 'q')

        db.close();
        // 关闭数据库后才能新增表
        db.version(verno.value).stores(schema);

        // 打开数据库，后续才能对数据库进行curd
        db.open();

        // console.log(db.test1688135539713, 'q')
      })
      .catch((e) => {
        console.log(e);
      });
  });

  function getTable(table) {
    let tables = Object.keys(schema);
    if (!tables.includes(table)) {
      return false;
    }
    return db[table];
  }

  async function addTable(tableName, tableSchema) {
    verno.value = verno.value + 1;
    await db.close();

    schema[tableName] = tableSchema;

    db.version(verno.value).stores(schema);

    await db.open();
    // db.open()
  }

  return {
    db,
    getTable,
    schema,
    addTable,
  };
}

export { createDB };
