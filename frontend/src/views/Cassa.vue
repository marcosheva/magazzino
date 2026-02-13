<template>
  <div class="cassa-page">
    <h1 class="page-title">Movimenti di cassa</h1>

    <div class="saldo-card card">
      <span class="saldo-label">Saldo attuale</span>
      <span class="saldo-value num" :class="saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo'">
        {{ formatEuro(saldo) }}
      </span>
    </div>

    <div class="form-card card">
      <h2 class="card-title">Nuovo movimento</h2>
      <form @submit.prevent="aggiungi" class="cassa-form">
        <div class="form-row">
          <div class="input-group">
            <label>Tipo</label>
            <select v-model="nuovo.tipo" required>
              <option value="entrata">Entrata</option>
              <option value="uscita">Uscita</option>
            </select>
          </div>
          <div class="input-group">
            <label>Importo (€) *</label>
            <input v-model.number="nuovo.importo" type="number" step="0.01" min="0" required />
          </div>
        </div>
        <div class="input-group">
          <label>Descrizione</label>
          <input v-model="nuovo.descrizione" placeholder="Descrizione movimento" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="salvando">
          {{ salvando ? 'Salvataggio...' : 'Aggiungi' }}
        </button>
      </form>
    </div>

    <div class="lista-card card">
      <h2 class="card-title">Elenco movimenti</h2>
      <div v-if="loading" class="loading">Caricamento...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!movimenti.length" class="empty">Nessun movimento.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Importo</th>
              <th>Descrizione</th>
              <th>Saldo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimenti" :key="m._id">
              <td>{{ formatDate(m.createdAt) }}</td>
              <td>
                <span class="badge" :class="m.tipo === 'entrata' ? 'badge-success' : 'badge-warning'">
                  {{ m.tipo === 'entrata' ? 'Entrata' : 'Uscita' }}
                </span>
              </td>
              <td class="num" :class="m.tipo === 'entrata' ? 'importo-positivo' : 'importo-negativo'">
                {{ m.tipo === 'entrata' ? '+' : '−' }}{{ formatEuro(m.importo) }}
              </td>
              <td>{{ m.descrizione || '–' }}</td>
              <td class="num" :class="(m.saldoProgressivo ?? 0) >= 0 ? 'saldo-positivo' : 'saldo-negativo'">
                {{ formatEuro(m.saldoProgressivo ?? 0) }}
              </td>
              <td class="actions">
                <button type="button" class="btn btn-ghost small" @click="apriModifica(m)">Modifica</button>
                <button type="button" class="btn btn-ghost small danger" @click="confermaElimina(m)">Elimina</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modale modifica -->
    <div v-if="modificaAperta" class="modal-overlay" @click.self="modificaAperta = null">
      <div class="modal card">
        <h3>Modifica movimento</h3>
        <form @submit.prevent="salvaModifica" class="cassa-form">
          <div class="input-group">
            <label>Tipo</label>
            <select v-model="modificaForm.tipo" required>
              <option value="entrata">Entrata</option>
              <option value="uscita">Uscita</option>
            </select>
          </div>
          <div class="input-group">
            <label>Importo (€) *</label>
            <input v-model.number="modificaForm.importo" type="number" step="0.01" min="0" required />
          </div>
          <div class="input-group">
            <label>Descrizione</label>
            <input v-model="modificaForm.descrizione" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="modificaAperta = null">Annulla</button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">Salva</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modale conferma elimina -->
    <div v-if="eliminaTarget" class="modal-overlay" @click.self="eliminaTarget = null">
      <div class="modal card">
        <p>Eliminare questo movimento? ({{ eliminaTarget.tipo }}, {{ formatEuro(eliminaTarget.importo) }})</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="eliminaTarget = null">Annulla</button>
          <button type="button" class="btn btn-danger" @click="eseguiElimina">Elimina</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  getCassaMovements,
  getCassaSaldo,
  createCassaMovement,
  updateCassaMovement,
  deleteCassaMovement,
} from '../api/cassa.js';

const movimenti = ref([]);
const saldo = ref(0);
const loading = ref(true);
const error = ref('');
const salvando = ref(false);
const nuovo = reactive({ tipo: 'entrata', importo: 0, descrizione: '' });
const modificaAperta = ref(null);
const modificaForm = reactive({ tipo: 'entrata', importo: 0, descrizione: '' });
const eliminaTarget = ref(null);

function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n ?? 0);
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

async function carica() {
  loading.value = true;
  error.value = '';
  try {
    const [lista, saldoAttuale] = await Promise.all([getCassaMovements(), getCassaSaldo()]);
    movimenti.value = lista;
    saldo.value = saldoAttuale ?? 0;
  } catch (e) {
    error.value = e.message || 'Errore caricamento';
  } finally {
    loading.value = false;
  }
}

async function aggiungi() {
  salvando.value = true;
  error.value = '';
  try {
    await createCassaMovement({
      tipo: nuovo.tipo,
      importo: Number(nuovo.importo) || 0,
      descrizione: (nuovo.descrizione || '').trim(),
    });
    nuovo.importo = 0;
    nuovo.descrizione = '';
    await carica();
  } catch (e) {
    error.value = e.message || 'Errore salvataggio';
  } finally {
    salvando.value = false;
  }
}

function apriModifica(m) {
  modificaAperta.value = m;
  modificaForm.tipo = m.tipo;
  modificaForm.importo = m.importo;
  modificaForm.descrizione = m.descrizione || '';
}

async function salvaModifica() {
  if (!modificaAperta.value) return;
  salvando.value = true;
  error.value = '';
  try {
    await updateCassaMovement(modificaAperta.value._id, {
      tipo: modificaForm.tipo,
      importo: Number(modificaForm.importo) || 0,
      descrizione: (modificaForm.descrizione || '').trim(),
    });
    modificaAperta.value = null;
    await carica();
  } catch (e) {
    error.value = e.message || 'Errore modifica';
  } finally {
    salvando.value = false;
  }
}

function confermaElimina(m) {
  eliminaTarget.value = m;
}

async function eseguiElimina() {
  if (!eliminaTarget.value) return;
  try {
    await deleteCassaMovement(eliminaTarget.value._id);
    eliminaTarget.value = null;
    await carica();
  } catch (e) {
    error.value = e.message || 'Errore eliminazione';
  }
}

onMounted(carica);
</script>

<style scoped>
.cassa-page {
  max-width: 900px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.saldo-card {
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 1.5rem;
}

.saldo-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.saldo-value {
  font-size: 2rem;
  font-weight: 700;
}

.saldo-positivo {
  color: var(--accent);
}

.saldo-negativo {
  color: var(--danger);
}

.form-card {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.cassa-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.importo-positivo {
  color: var(--accent);
}

.importo-negativo {
  color: var(--danger);
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn.small {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

.loading,
.error,
.empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
}

.error {
  color: var(--danger);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal {
  max-width: 400px;
  width: 100%;
}

.modal h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
