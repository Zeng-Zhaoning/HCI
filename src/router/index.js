import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Lobby from '../views/Lobby.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/User/Login.vue')
  },
  {
    path: '/Register',
    name: 'Register',
    component: () => import('../views/User/Register.vue')
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
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
