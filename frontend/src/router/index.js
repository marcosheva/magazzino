import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from '../api/auth.js';

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { title: 'Login', public: true } },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: 'Dashboard' } },
  { path: '/prodotti', name: 'Prodotti', component: () => import('../views/ProductList.vue'), meta: { title: 'Prodotti' } },
  { path: '/prodotti/nuovo', name: 'NuovoProdotto', component: () => import('../views/ProductForm.vue'), meta: { title: 'Nuovo prodotto' } },
  { path: '/prodotti/:id', name: 'DettaglioProdotto', component: () => import('../views/ProductDetail.vue'), meta: { title: 'Dettaglio' } },
  { path: '/prodotti/:id/modifica', name: 'ModificaProdotto', component: () => import('../views/ProductForm.vue'), meta: { title: 'Modifica prodotto' } },
  { path: '/movimenti', name: 'Movimenti', component: () => import('../views/Movements.vue'), meta: { title: 'Storico movimenti' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.public) {
    if (isLoggedIn() && to.path === '/login') return next('/');
    return next();
  }
  if (!isLoggedIn()) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  next();
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Magazzino` : 'Magazzino';
});

export default router;
