import { ref, reactive } from 'vue'

export   function useTest (first, second) {
  let fRef = ref(first)

  let a = ref(Date.now())

  let b = reactive({
    date: Date.now()
  })

  setTimeout(() => {
    b.date = 'JOU' + Date.now()
  }, 3000)

  return {
    fRef,
    a,
    b
  }
}