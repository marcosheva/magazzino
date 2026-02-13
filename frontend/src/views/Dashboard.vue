<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">Riepilogo del magazzino</p>

    <div v-if="loading" class="loading">Caricamento...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Prodotti totali</span>
          <span class="stat-value num">{{ stats.totaleProdotti }}</span>
        </div>
        <div class="stat-card stat-warning" v-if="stats.sottoSoglia > 0">
          <span class="stat-label">Sotto soglia minima</span>
          <span class="stat-value num">{{ stats.sottoSoglia }}</span>
          <router-link to="/prodotti?sottoSoglia=true" class="stat-link">Vedi lista →</router-link>
        </div>
        <div class="stat-card" v-else>
          <span class="stat-label">Sotto soglia</span>
          <span class="stat-value num">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Valore magazzino</span>
          <span class="stat-value num">{{ formatEuro(stats.valoreMagazzino) }}</span>
        </div>
        <router-link to="/cassa" class="stat-card stat-cassa">
          <span class="stat-label">Saldo cassa</span>
          <span class="stat-value num" :class="saldoCassa >= 0 ? 'saldo-ok' : 'saldo-neg'">{{ formatEuro(saldoCassa) }}</span>
          <span class="stat-link">Vai a Cassa →</span>
        </router-link>
      </div>

      <section class="section" v-if="prodottiSottoSoglia.length">
        <h2 class="section-title">Prodotti sotto soglia</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome prodotto</th>
                <th>Formato</th>
                <th>Codice</th>
                <th>Quantità</th>
                <th>Soglia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in prodottiSottoSoglia" :key="p._id">
                <td>
                  <router-link :to="'/prodotti/' + p._id" class="product-link">{{ p.nome }}</router-link>
                </td>
                <td>{{ p.formato || '–' }}</td>
                <td class="num">{{ p.codice }}</td>
                <td class="num">{{ p.quantita }} {{ p.unita }}</td>
                <td class="num">{{ p.sogliaMinima }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <router-link to="/prodotti?sottoSoglia=true" class="btn btn-primary btn-sm">Vedi tutti i prodotti sotto soglia</router-link>
      </section>

      <section class="section">
        <h2 class="section-title">Per categoria</h2>
        <div class="table-wrap">
          <table v-if="stats.perCategoria?.length">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>N° prodotti</th>
                <th>Quantità totale</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in stats.perCategoria" :key="c._id">
                <td>{{ c._id || '–' }}</td>
                <td class="num">{{ c.count }}</td>
                <td class="num">{{ c.quantita }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">Nessun dato per categoria.</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStats, getProducts } from '../api/products';
import { getCassaSaldo } from '../api/cassa.js';

const loading = ref(true);
const error = ref('');
const stats = ref({
  totaleProdotti: 0,
  sottoSoglia: 0,
  perCategoria: [],
  valoreMagazzino: 0,
});
const prodottiSottoSoglia = ref([]);
const saldoCassa = ref(0);

function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

onMounted(async () => {
  try {
    const [statsData, prodottiList, saldo] = await Promise.all([
      getStats(),
      getProducts({ sottoSoglia: 'true' }),
      getCassaSaldo().catch(() => 0),
    ]);
    stats.value = statsData;
    prodottiSottoSoglia.value = prodottiList || [];
    saldoCassa.value = saldo ?? 0;
  } catch (e) {
    error.value = e.message || 'Errore caricamento statistiche';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 900px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.error {
  color: var(--danger);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card.stat-warning {
  border-color: var(--warning);
  background: rgba(245, 158, 11, 0.05);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-link {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.stat-card.stat-cassa {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card.stat-cassa:hover {
  border-color: var(--accent);
  background: var(--surface-hover);
}

.stat-value.saldo-ok {
  color: var(--accent);
}

.stat-value.saldo-neg {
  color: var(--danger);
}

.section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-muted);
}

.muted {
  color: var(--text-muted);
  padding: 1rem;
}

.product-link {
  font-weight: 600;
}

.product-link:hover {
  text-decoration: underline;
}

.btn-sm {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
</style>
