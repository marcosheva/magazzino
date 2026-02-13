<template>
  <div class="app">
    <header v-if="showHeader" class="header">
      <div class="container header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">&#128230;</span>
          <span>Magazzino</span>
        </router-link>
        <button type="button" class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Menu">
          ☰
        </button>
        <nav class="nav" :class="{ 'nav-open': menuOpen }">
          <router-link to="/" @click="menuOpen = false">Dashboard</router-link>
          <router-link to="/prodotti" @click="menuOpen = false">Prodotti</router-link>
          <router-link to="/movimenti" @click="menuOpen = false">Movimenti</router-link>
          <router-link to="/cassa" @click="menuOpen = false">Cassa</router-link>
          <router-link to="/prodotti/nuovo" @click="menuOpen = false">Nuovo</router-link>
          <button type="button" class="btn btn-ghost logout-btn" @click="logout">Esci</button>
        </nav>
      </div>
    </header>
    <main class="main">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { clearToken } from './api/auth.js';

const route = useRoute();
const showHeader = computed(() => !route.meta.public);
const menuOpen = ref(false);

function logout() {
  clearToken();
  window.location.href = '/login';
}
</script>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }
.header { border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 100; }
.header-inner { display: flex; align-items: center; justify-content: space-between; height: 3.5rem; }
.logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.25rem; color: var(--text); text-decoration: none; }
.logo:hover { text-decoration: none; color: var(--accent); }
.logo-icon { font-size: 1.5rem; }
.nav { display: flex; gap: 0.25rem; }
.nav a { padding: 0.5rem 0.85rem; border-radius: var(--radius); color: var(--text-muted); text-decoration: none; font-weight: 500; }
.nav a:hover { color: var(--text); background: var(--surface-hover); }
.nav a.router-link-active { color: var(--accent); background: rgba(34, 197, 94, 0.1); }
.menu-toggle { display: none; }
.logout-btn { margin-left: 0.5rem; color: var(--text-muted); }
.logout-btn:hover { color: var(--danger); }
.main { flex: 1; padding: 1.5rem 0 3rem; }

@media (max-width: 768px) {
  .header-inner { position: relative; }
  .menu-toggle { display: block; }
  .nav { position: absolute; top: 100%; left: 0; right: 0; background: var(--surface); border-bottom: 1px solid var(--border); flex-direction: column; gap: 0; max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
  .nav-open { max-height: 400px; }
  .nav a, .nav .logout-btn { display: block; padding: 1rem; border-bottom: 1px solid var(--border); width: 100%; text-align: left; }
  .nav .logout-btn { margin-left: 0; }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
