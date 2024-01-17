import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/look-today-voca',
    name: 'lookTodayVoca',
    component: () => import('../views/todayVocabularyList.vue')
  },
  {
    path: '/words-iframe',
    name: 'wordsIframe',
    component: () => import('../views/wordsIframe.vue')
  },
  {
    path: '/',
    name: 'wordMainPage',
    component: () => import('../views/wordMainPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
