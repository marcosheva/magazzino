<template>
  <div class="product-list">
    <div class="page-head">
      <h1 class="page-title">Prodotti</h1>
      <router-link to="/prodotti/nuovo" class="btn btn-primary">+ Nuovo prodotto</router-link>
    </div>

    <div class="toolbar card">
      <div class="search-row">
        <div class="search-group">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cerca per nome, codice, categoria..."
            class="search-input"
            @input="debouncedLoad()"
          />
          <button type="button" class="btn btn-ghost scanner-btn" @click="showScanner = true" title="Scansiona barcode">
            📷
          </button>
        </div>
        <label class="filter-check">
          <input type="checkbox" v-model="soloSottoSoglia" @change="load()" />
          Solo sotto soglia
        </label>
        <select v-model="sortBy" @change="load()" class="sort-select">
          <option value="nome">Ordina per nome</option>
          <option value="codice">Ordina per codice</option>
          <option value="quantita">Ordina per quantita</option>
          <option value="categoria">Ordina per categoria</option>
        </select>
        <select v-model="sortOrder" @change="load()" class="sort-order">
          <option value="1">Crescente</option>
          <option value="-1">Decrescente</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Caricamento...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!products.length" class="empty">Nessun prodotto trovato.</div>
    <template v-else>
      <div class="product-card-view">
        <div v-for="p in products" :key="p._id" class="product-card">
          <div class="product-card-header">
            <div>
              <router-link :to="'/prodotti/' + p._id" class="product-card-title link">{{ p.nome }}</router-link>
              <p class="product-card-code num">{{ p.codice }}</p>
            </div>
            <span
              class="badge"
              :class="p.sogliaMinima > 0 && p.quantita <= p.sogliaMinima ? 'badge-warning' : 'badge-success'"
            >
              {{ p.sogliaMinima > 0 && p.quantita <= p.sogliaMinima ? 'Sotto soglia' : 'Ok' }}
            </span>
          </div>
          <div class="product-card-body">
            <div><span class="product-card-label">Formato:</span> {{ p.formato || '–' }}</div>
            <div><span class="product-card-label">Categoria:</span> {{ p.categoria || '–' }}</div>
            <div><span class="product-card-label">Quantità:</span> <span class="num">{{ p.quantita }} {{ p.unita }}</span></div>
            <div><span class="product-card-label">Prezzo:</span> <span class="num">{{ formatEuro(p.prezzoUnitario) }}</span></div>
          </div>
          <div class="product-card-actions">
            <router-link :to="'/prodotti/' + p._id + '/modifica'" class="btn btn-primary small">Modifica</router-link>
            <button type="button" class="btn btn-ghost small danger" @click="confirmDelete(p)">Elimina</button>
          </div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
        <thead>
          <tr>
            <th>Codice</th>
            <th>Nome</th>
            <th>Formato</th>
            <th>Categoria</th>
            <th>Quantità</th>
            <th>Prezzo</th>
            <th>Stato</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p._id">
            <td class="num">{{ p.codice }}</td>
            <td>
              <router-link :to="'/prodotti/' + p._id" class="link">{{ p.nome }}</router-link>
            </td>
            <td>{{ p.formato || '–' }}</td>
            <td>{{ p.categoria }}</td>
            <td class="num">{{ p.quantita }} {{ p.unita }}</td>
            <td class="num">{{ formatEuro(p.prezzoUnitario) }}</td>
            <td>
              <span
                class="badge"
                :class="p.sogliaMinima > 0 && p.quantita <= p.sogliaMinima ? 'badge-warning' : 'badge-success'"
              >
                {{ p.sogliaMinima > 0 && p.quantita <= p.sogliaMinima ? 'Sotto soglia' : 'Ok' }}
              </span>
            </td>
            <td class="actions">
              <router-link :to="'/prodotti/' + p._id + '/modifica'" class="btn btn-ghost small">Modifica</router-link>
              <button type="button" class="btn btn-ghost small danger" @click="confirmDelete(p)">Elimina</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </template>

    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal card">
        <p>Eliminare <strong>{{ deleteTarget.nome }}</strong> ({{ deleteTarget.codice }})?</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="deleteTarget = null">Annulla</button>
          <button class="btn btn-danger" @click="doDelete">Elimina</button>
        </div>
      </div>
    </div>

    <BarcodeScanner v-if="showScanner" :show="showScanner" @close="showScanner = false" @scanned="onBarcodeScanned" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProducts, deleteProduct } from '../api/products';
import BarcodeScanner from '../components/BarcodeScanner.vue';

const route = useRoute();
const products = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const soloSottoSoglia = ref(false);
const sortBy = ref('nome');
const sortOrder = ref('1');
const deleteTarget = ref(null);
const showScanner = ref(false);

let debounceTimer;

function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

function params() {
  const p = { sort: sortBy.value, order: sortOrder.value };
  if (searchQuery.value.trim()) p.q = searchQuery.value.trim();
  if (soloSottoSoglia.value) p.sottoSoglia = 'true';
  return p;
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    products.value = await getProducts(params());
  } catch (e) {
    error.value = e.message || 'Errore caricamento';
  } finally {
    loading.value = false;
  }
}

function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(load, 300);
}

function confirmDelete(p) {
  deleteTarget.value = p;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await deleteProduct(deleteTarget.value._id);
    deleteTarget.value = null;
    load();
  } catch (e) {
    error.value = e.message || 'Errore eliminazione';
  }
}

onMounted(() => {
  if (route.query.sottoSoglia === 'true') soloSottoSoglia.value = true;
  load();
});

watch(() => route.query.sottoSoglia, (v) => {
  soloSottoSoglia.value = v === 'true';
  load();
});

function onBarcodeScanned(code) {
  searchQuery.value = code;
  load();
}
</script>

<style scoped>
.product-list { max-width: 1100px; }
.page-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.page-title { font-size: 1.75rem; font-weight: 700; }
.toolbar { margin-bottom: 1rem; }
.search-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.search-group { display: flex; gap: 0.5rem; flex: 1; min-width: 200px; max-width: 400px; }
.search-input { flex: 1; }
.scanner-btn { padding: 0.6rem 0.85rem; font-size: 1.2rem; }
.filter-check { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; cursor: pointer; }
.sort-select, .sort-order { width: auto; min-width: 140px; }
.loading, .error, .empty { padding: 2rem; text-align: center; color: var(--text-muted); }
.error { color: var(--danger); }
.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn.small { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
.danger { color: var(--danger); }
.danger:hover { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
.link { color: var(--text); text-decoration: none; font-weight: 500; }
.link:hover { color: var(--accent); text-decoration: underline; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal { max-width: 400px; width: 100%; }
.modal p { margin-bottom: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }

@media (min-width: 769px) {
  .product-card-view { display: none; }
}

@media (max-width: 768px) {
  .product-card-view { display: block; }
  .table-wrap { display: none; }
}
</style>
