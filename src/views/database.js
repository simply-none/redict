import Dexie from 'dexie'

function createDB (tableName) {
  const db = new Dexie('friend')

  db.version(1).stores({
    ['friend']: '++id, name, age',
    ['friend1']: '++id, name, age',
    ['friend2']: '++id, name, age',
    ['friend3']: '++id, name, age',
    ['friend4']: '++id, name, age',
    ['friend5']: '++id, name, age',
    ['friend6']: '++id, name, age',
    ['friend7']: '++id, name, age',
    ['friend8']: '++id, name, age',
    ['friend9']: '++id, name, age',
    ['friend10']: '++id, name, age',
    ['friend11']: '++id, name, age',
    ['friend12']: '++id, name, age',
    ['friend13']: '++id, name, age',
  })

  return {
    db
  }
}

export {
  createDB
}