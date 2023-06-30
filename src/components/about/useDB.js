import { ref, reactive, computed, watch } from "vue";

import Dexie from "dexie";

export default function useDB(database) {
  const db = new Dexie(database);


  let verno = ref(Date.now())
  db.version(verno.value).stores({
    words: '++id, name, value'
  });


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
    words: db.words,
    test: db.test,
    createTable,
  };
}
