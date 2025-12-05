import { createRouter, createWebHistory } from 'vue-router'
import Board from '../components/Board.vue'
import CityIntro from '../components/CityIntro.vue'

const routes = [
  {
    path: '/',
    name: 'Board',
    component: Board
  },
  {
    path: '/city/:city',
    name: 'CityIntro',
    component: CityIntro,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router