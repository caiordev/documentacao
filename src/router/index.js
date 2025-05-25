import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Configuração para o GitHub Pages
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
     {
       path: '/auth/callback',
       name: 'callback',
       component: () => import('../views/CallbackView.vue')
     },
    {
      path: '/project/:owner/:name',
      name: 'project',
      component: () => import('../views/ProjectDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/LogoutView.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/apis',
    //   name: 'apis',
    //   component: () => import('../views/ApisView.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/ferramentas',
    //   name: 'ferramentas',
    //   component: () => import('../views/FerramentasView.vue'),
    //   meta: { requiresAuth: true }
    // },
     {
       path: '/docs/:service',
       name: 'markdown',
       component: () => import('../views/MarkdownView.vue'),
       meta: { requiresAuth: true }
     },
     // Rota de fallback para o GitHub Pages
     {
       path: '/:pathMatch(.*)*',
       redirect: '/'
     }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('github_access_token')
  
  if (to.name === 'login' || to.name === 'callback') {
    next()
    return
  }
  
  if (!isAuthenticated) {
    next({ name: 'login' })
    return
  }
  
  next()
})

export default router
