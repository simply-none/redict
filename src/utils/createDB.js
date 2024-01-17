import Dexie from "dexie";
import { removeBasicInfo } from "../stores/books";

let dbName = "test";

// dexie库是全局唯一的实例，所以使用非响应式的常量比较好
let db = new Dexie(dbName);

// await，在应用渲染之前就添加，防止读取不到
await db
  .open()
  .then((f, r) => {
    console.log(f, r);
    if (!f || f.name !== dbName) {
      return false;
    }
    db.close();
    let schema = getSchema()
    // 就算之前有stores集合，也必须调用一次，否则，后面读取不到table
    db.version(db.verno || 1).stores(schema);
    db.open();
  })
  .catch((r) => {
    if (r.name === "NoSuchDatabaseError") {
      removeBasicInfo();
      // 初始化时，若没有需要设置的table，则stores参数为空
      // 若为{}，会报Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.
      db.version(1).stores({
        "today-studied-voca": "++id, n, date",
        "studied-voca": "++id, n, date",
      });
      //设置stores之后，必须调用open，不然不会存到数据库中
      db.open();
    }
    console.log(r);
  });

window.onunhandledrejection = function (event) {
  let { name, message } = event.reason;
  message = message.split(/\s/);
  console.error(event, "捕获的dexie错误", message);
  event.preventDefault();
  if (name === "SchemaError") {
    handleSchemaError(message)
  }
};

function handleSchemaError (message){ 
  let keyIndex = message.findIndex(i => i === 'KeyPath') + 1
    let storeIndex = message.findIndex(i => i === 'store') + 1
    console.log(keyIndex, storeIndex)
    if (keyIndex && storeIndex) {
      db.close();

      let schema = getSchema()
      schema[message[storeIndex]] = schema[message[storeIndex]] + ',' + message[keyIndex]

      // 就算之前有stores集合，也必须调用一次，否则，后面读取不到table
      db.version(db.verno + 1).stores(schema);
      db.open();
    }
}

function getSchema () {
  let schema = {};
  db.tables.forEach(function (table) {
    let tableSchema = [table.schema.primKey.src];
    table.schema.indexes.forEach((index) => {
      tableSchema.push(index.src);
    });
    schema[table.name] = tableSchema.join(",");
  });
  return schema
}

export { db };
