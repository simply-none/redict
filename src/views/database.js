import Dexie from 'dexie'
import { reactive, ref } from 'vue'

function createDB(tableName) {
 
  let name = ref(tableName)
  const db = new Dexie(name.value)
  console.log(tableName, db, 1)
  let verno = ref(1)
  let schema = reactive({})
  let tables = reactive({})

  db.version(verno.value).stores(schema);

  db.open().then(function (db) {
    console.log(db)
    verno.value = db.verno
    
    db.tables.forEach(function (table) {
      let tableSchema = [table.schema.primKey.src]
      table.schema.indexes.forEach(index => {
        tableSchema.push(index.src)
      })
      schema[table.name] = tableSchema.join(', ')
    });

    console.log(schema, 'schema')
    // 在store之前是获取不到相关的table的，undefined
    console.log(db.test1688135539713, 'q')

    db.close()
    // 关闭数据库后才能新增表
    db.version(verno.value).stores(schema);

    // 打开数据库，后续才能对数据库进行curd
    db.open()

    console.log(db.test1688135539713, 'q')

    
  });

  async function addTable(tableName, tableSchema) {
    verno.value = verno.value + 1
    db.close();
    schema[tableName] = tableSchema;

    // Now use statically opening to add table:
    var upgraderDB = new Dexie(name.value);
    upgraderDB.version(verno.value).stores(schema);
    return upgraderDB.open().then(function () {
      upgraderDB.close();
      return db.open(); // Open the dynamic Dexie again.
    });
  }

  return {
    db,
    ...schema,
    addTable
  }
}

export {
  createDB
}