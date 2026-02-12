<template>
  <div class="movements">
    <div class="page-head">
      <h1 class="page-title">Storico movimenti</h1>
      <router-link to="/prodotti" class="btn btn-ghost">← Prodotti</router-link>
    </div>

    <div v-if="loading" class="loading">Caricamento...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!movements.length" class="empty">Nessun movimento registrato.</div>
    <div v-else class="movements-list">
      <div v-for="m in movements" :key="m._id" class="movement-card card">
        <div class="movement-header">
          <span class="movement-type" :class="m.tipo === 'carico' ? 'type-carico' : 'type-scarico'">
            {{ m.tipo === 'carico' ? '➕ Carico' : '➖ Scarico' }}
          </span>
          <span class="movement-date">{{ formatDate(m.createdAt) }}</span>
        </div>
        <div class="movement-body">
          <p class="movement-product">
            <router-link :to="'/prodotti/' + m.prodotto?._id" class="product-link">
              {{ m.prodotto?.nome || 'Prodotto eliminato' }}
            </router-link>
            <span class="movement-code">({{ m.prodotto?.codice || 'N/A' }})</span>
          </p>
          <div class="movement-quantity">
            <span class="qty-old">{{ m.quantitaPrecedente }}</span>
            <span class="qty-arrow">→</span>
            <span class="qty-new">{{ m.quantitaNuova }}</span>
            <span class="qty-diff">({{ m.tipo === 'carico' ? '+' : '-' }}{{ m.quantita }})</span>
          </div>
          <p v-if="m.motivo" class="movement-motivo">{{ m.motivo }}</p>
          <p class="movement-user">Utente: {{ m.utente }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getMovements } from '../api/movements';

const route = useRoute();
const movements = ref([]);
const loading = ref(true);
const error = ref('');

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

onMounted(async () => {
  try {
    const params = route.query.prodottoId ? { prodottoId: route.query.prodottoId } : {};
    movements.value = await getMovements(params);
  } catch (e) {
    error.value = e.message || 'Errore caricamento movimenti';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.movements {
  max-width: 800px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.error {
  color: var(--danger);
}

.movements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movement-card {
  border-left: 4px solid var(--border);
}

.movement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.movement-type {
  font-weight: 600;
  font-size: 0.9rem;
}

.type-carico {
  color: var(--accent);
}

.type-scarico {
  color: var(--danger);
}

.movement-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.movement-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.movement-product {
  font-weight: 600;
  margin: 0;
}

.product-link {
  color: var(--text);
  text-decoration: none;
}

.product-link:hover {
  color: var(--accent);
  text-decoration: underline;
}

.movement-code {
  color: var(--text-muted);
  font-weight: normal;
  font-size: 0.9em;
}

.movement-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
}

.qty-old {
  color: var(--text-muted);
}

.qty-arrow {
  color: var(--text-muted);
}

.qty-new {
  font-weight: 600;
  color: var(--accent);
}

.qty-diff {
  color: var(--text-muted);
  font-size: 0.9em;
}

.movement-motivo {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.movement-user {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}
</style>
