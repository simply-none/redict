import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/about/index.vue'

export const routes = [
  {
    path: '/',
    redirect: '/test'
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Setting.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
