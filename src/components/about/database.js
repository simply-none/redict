import Dexie from 'dexie'

function createDB (tableName) {
  const db = new Dexie('friend')

  db.version(1).stores({
    ['friend' + tableName]: '++id, name, age'
  })

  return {
    db
  }
}

export {
  createDB
}