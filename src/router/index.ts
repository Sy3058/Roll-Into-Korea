import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, // 시작 화면
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/MainGameView.vue'), // 메인 게임
    },
    {
      path: '/journey',
      name: 'journey',
      component: () => import('@/views/JourneyView.vue'), // 여행 기록
    },
  ],
})

export default router
