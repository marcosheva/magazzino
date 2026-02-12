<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">Caricamento...</div>
    <div v-else-if="error" class="error card">{{ error }}</div>
    <template v-else>
      <div class="page-head">
        <div>
          <router-link to="/prodotti" class="back-link">← Prodotti</router-link>
          <h1 class="page-title">{{ product.nome }}</h1>
          <p class="codice num">{{ product.codice }}</p>
        </div>
        <div class="head-actions">
          <router-link :to="'/movimenti?prodottoId=' + product._id" class="btn btn-ghost">Storico</router-link>
          <router-link :to="'/prodotti/' + product._id + '/modifica'" class="btn btn-primary">Modifica</router-link>
        </div>
      </div>

      <div class="detail-grid">
        <div class="card main-info">
          <h2 class="card-title">Dettagli</h2>
          <dl class="dl">
            <dt>Categoria</dt>
            <dd>{{ product.categoria }}</dd>
            <dt v-if="product.codiceABarre">Codice a barre</dt>
            <dd v-if="product.codiceABarre" class="num">{{ product.codiceABarre }}</dd>
            <dt v-if="product.formato">Formato</dt>
            <dd v-if="product.formato">{{ product.formato }}</dd>
            <dt>Quantità</dt>
            <dd class="num">{{ product.quantita }} {{ product.unita }}</dd>
            <dt>Prezzo unitario</dt>
            <dd class="num">{{ formatEuro(product.prezzoUnitario) }}</dd>
            <dt>Valore totale</dt>
            <dd class="num">{{ formatEuro((product.quantita || 0) * (product.prezzoUnitario || 0)) }}</dd>
            <dt>Soglia minima</dt>
            <dd class="num">{{ product.sogliaMinima ?? 0 }} {{ product.unita }}</dd>
            <dt>Stato</dt>
            <dd>
              <span
                class="badge"
                :class="product.sogliaMinima > 0 && product.quantita <= product.sogliaMinima ? 'badge-warning' : 'badge-success'"
              >
                {{ product.sogliaMinima > 0 && product.quantita <= product.sogliaMinima ? 'Sotto soglia' : 'Ok' }}
              </span>
            </dd>
            <dt v-if="product.posizione">Posizione</dt>
            <dd v-if="product.posizione">{{ product.posizione }}</dd>
          </dl>
        </div>
        <div class="card" v-if="product.descrizione">
          <h2 class="card-title">Descrizione</h2>
          <p class="description">{{ product.descrizione }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getProduct } from '../api/products';

const route = useRoute();
const product = ref({});
const loading = ref(true);
const error = ref('');

function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

onMounted(async () => {
  try {
    product.value = await getProduct(route.params.id);
  } catch (e) {
    error.value = e.message || 'Prodotto non trovato';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.product-detail {
  max-width: 700px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.back-link:hover {
  color: var(--accent);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
}

.codice {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.head-actions {
  display: flex;
  gap: 0.5rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1.5rem;
  align-items: baseline;
}

.dl dt {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.dl dd {
  font-weight: 500;
}

.description {
  color: var(--text-muted);
  line-height: 1.6;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}
</style>
