import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/named-word-list',
    name: 'namedWordList',
    meta: {
      title: '单词库列表'
    },
    component: () => import('../views/namedWordList/index.vue')
  },
  {
    path: '/words-iframe',
    name: 'wordsIframe',
    meta: {
      title: '外链查询'
    },
    component: () => import('../views/wordsIframe/index.vue')
  },
  {
    path: '/',
    name: 'wordMainPage',
    meta: {
      title: ''
    },
    component: () => import('../views/wordMainPage/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  console.log(to, from, 'cc')
  document.title = '轻松背单词' + (to.meta.title ? '-' + to.meta.title : '')
  next()
})

export default router
