import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Lobby from '../views/Lobby.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    // component: Home
    component: Lobby
  },{
    path: '/lobby',
    name: 'Lobby',
    component: () => import('../views/Lobby.vue')
  },
  {
    path: '/CytoscapeKG',
    name: 'CytoscapeKG',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../components/CytoscapeKG.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
