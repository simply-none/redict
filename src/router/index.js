import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/about/index.vue'

export const routes = [
  // {
  //   path: '/home',
  //   name: 'home',
  //   component: HomeView
  // },
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
