import Dexie from "dexie";
import { reactive, ref, watch, toRaw } from "vue";

import { useBookStore } from '../stores/books'
import { storeToRefs } from 'pinia'

async function createDB(databaseName, initTableStore) {
  let name = ref(databaseName);
  let db = new Dexie(name.value);
  let verno = ref(1);
  let schema = reactive({});
  let tables = reactive({});

  const { updateBooks } = useBookStore()
  const { books } = storeToRefs(useBookStore())

  watch(() => schema, (newV, oldV) => {
    books.value = newV
  }, {
    deep: true
  })

  await Dexie.exists(name.value).then(exists => {
    if (!exists) {
      db = new Dexie(name.value);
      initTableStore && (schema[initTableStore.name] = initTableStore.schema);
      db.version(verno.value).stores(schema);
    }
  })

  db.open().then(() => {
    verno.value = db.verno || 1;

    db.tables.forEach(function (table) {
      let tableSchema = [table.schema.primKey.src];
      table.schema.indexes.forEach((index) => {
        tableSchema.push(index.src);
      });
      schema[table.name] = tableSchema.join(", ");
    });
    initTableStore && (schema[initTableStore.name] = initTableStore.schema);

    // 在store之前是获取不到相关的table的，undefined
    // console.log(db.test1688135539713, 'q')

    db.close();
    // 关闭数据库后才能新增表
    verno.value = verno.value + 1;
    db.version(verno.value).stores(schema);

    // 打开数据库，后续才能对数据库进行curd
    db.open();

    // console.log(db.test1688135539713, 'q')
  });

  function getTable (table) {
    let tables = Object.keys(schema)
    if (!tables.includes(table)) {
      return false
    }
    return db[table]
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
