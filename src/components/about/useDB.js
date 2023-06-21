import { ref, reactive, computed, watch } from "vue";

import Dexie from "dexie";

export default function useDB(database) {
  const db = reactive(new Dexie(database));

  let verno = ref(0)

  function createTable(tablename, keyString = "++id, name, value") {
    db.close();
    console.log(db.verno, "verno", db.tables);
    db.version(db.verno+ 1).stores({
      [tablename]: keyString
    });
    setTimeout(() => {
      db.open().then(() => {
        db[tablename].add({
          name: "qiu",
          age: 21,
        });
      });
    }, 1000);
  }

  return {
    test: db.test,
    createTable,
    db,
  };
}
