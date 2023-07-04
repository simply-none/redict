import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/look-today-voca',
    name: 'lookTodayVoca',
    component: () => import('../views/todayVocabularyList.vue')
  },
  {
    path: '/',
    name: 'test',
    component: () => import('../views/vocabulary.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
