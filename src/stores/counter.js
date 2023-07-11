import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', () => {
  let dbInstance = ref(null)

  function updateDbInstance (ins) {
    dbInstance.value = ins
  }

  return {
    dbInstance,
    updateDbInstance
  }
})