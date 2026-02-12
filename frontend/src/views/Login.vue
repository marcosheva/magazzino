<template>
  <div class="login-page">
    <div class="login-card card">
      <h1 class="login-title">
        <span class="logo-icon">&#128230;</span>
        Magazzino
      </h1>
      <p class="login-subtitle">Accedi per continuare</p>
      <form @submit.prevent="submit" class="login-form">
        <div class="input-group">
          <label for="username">Utente</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
            placeholder="Utente"
          />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="Password"
          />
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Accesso in corso...' : 'Accedi' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login, setToken } from '../api/auth.js';

const router = useRouter();
const route = useRoute();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const data = await login(username.value, password.value);
    setToken(data.token);
    const redirect = route.query.redirect || '/';
    router.replace(redirect);
  } catch (e) {
    error.value = e.message || 'Utente o password non validi';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.logo-icon {
  font-size: 1.75rem;
}

.login-subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-error {
  color: var(--danger);
  font-size: 0.9rem;
  margin: -0.25rem 0 0;
}

.btn-block {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
