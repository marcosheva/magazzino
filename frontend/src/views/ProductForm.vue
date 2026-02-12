<template>
  <div class="product-form">
    <div class="page-head">
      <h1 class="page-title">{{ isEdit ? 'Modifica prodotto' : 'Nuovo prodotto' }}</h1>
      <router-link to="/prodotti" class="btn btn-ghost">← Torna alla lista</router-link>
    </div>

    <div v-if="loadError" class="error card">{{ loadError }}</div>
    <form v-else class="form card" @submit.prevent="submit">
      <div class="form-grid">
        <div class="input-group">
          <label for="codice">Codice *</label>
          <input id="codice" v-model="form.codice" required placeholder="ART-001" :readonly="!isEdit" />
        </div>
        <div class="input-group">
          <label for="codiceABarre">Codice a barre</label>
          <div class="input-with-scan">
            <input id="codiceABarre" v-model="form.codiceABarre" placeholder="Scansiona o inserisci" />
            <button type="button" class="btn btn-ghost scan-btn" @click="showBarcodeScanner = true" title="Scansiona barcode">
              📷 Scansiona
            </button>
          </div>
        </div>
        <div class="input-group">
          <label for="nome">Nome *</label>
          <input id="nome" v-model="form.nome" required placeholder="Nome prodotto" />
        </div>
        <div class="input-group span-2">
          <label for="descrizione">Descrizione</label>
          <textarea id="descrizione" v-model="form.descrizione" rows="2" placeholder="Descrizione opzionale"></textarea>
        </div>
        <div class="input-group">
          <label for="categoria">Categoria</label>
          <input id="categoria" v-model="form.categoria" list="list-categoria" placeholder="Scegli o scrivi" />
          <datalist id="list-categoria">
            <option v-for="opt in opzioniCategoria" :key="opt" :value="opt" />
          </datalist>
        </div>
        <div class="input-group">
          <label for="posizione">Posizione in magazzino</label>
          <input id="posizione" v-model="form.posizione" list="list-posizione" placeholder="Scegli o scrivi" />
          <datalist id="list-posizione">
            <option v-for="opt in opzioniPosizione" :key="opt" :value="opt" />
          </datalist>
        </div>
        <div class="input-group">
          <label for="quantita">Quantità *</label>
          <input id="quantita" v-model.number="form.quantita" type="number" min="0" required />
        </div>
        <div class="input-group">
          <label for="unita">Unità</label>
          <select id="unita" v-model="form.unita">
            <option value="pz">pz</option>
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="m">m</option>
            <option value="m²">m²</option>
            <option value="scatola">scatola</option>
            <option value="colli">colli</option>
          </select>
        </div>
        <div class="input-group">
          <label for="formato">Formato</label>
          <input id="formato" v-model="form.formato" list="list-formato" placeholder="Scegli o scrivi" />
          <datalist id="list-formato">
            <option v-for="opt in opzioniFormato" :key="opt" :value="opt" />
          </datalist>
        </div>
        <div class="input-group">
          <label for="prezzoUnitario">Prezzo unitario (€)</label>
          <input id="prezzoUnitario" v-model.number="form.prezzoUnitario" type="number" min="0" step="0.01" />
        </div>
        <div class="input-group">
          <label for="sogliaMinima">Soglia minima (avviso)</label>
          <input id="sogliaMinima" v-model.number="form.sogliaMinima" type="number" min="0" />
        </div>
      </div>
      <div class="form-actions">
        <router-link to="/prodotti" class="btn btn-ghost">Annulla</router-link>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Salvataggio...' : (isEdit ? 'Salva' : 'Aggiungi') }}
        </button>
      </div>
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
    </form>

    <BarcodeScanner
      :show="showBarcodeScanner"
      @close="showBarcodeScanner = false"
      @scanned="(code) => { form.codiceABarre = code; showBarcodeScanner = false; }"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProduct, createProduct, updateProduct, getNextCode } from '../api/products';
import BarcodeScanner from '../components/BarcodeScanner.vue';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id && route.params.id !== 'nuovo');

const form = reactive({
  codice: '',
  codiceABarre: '',
  nome: '',
  descrizione: '',
  categoria: '',
  quantita: 0,
  unita: 'pz',
  formato: '',
  prezzoUnitario: 0,
  sogliaMinima: 0,
  posizione: '',
});

const showBarcodeScanner = ref(false);

const opzioniCategoria = [
  'Alimentari', 'Bevande', 'Pulizia', 'Elettronica', 'Cancelleria',
  'Igiene', 'Abbigliamento', 'Ferramenta', 'Giardinaggio', 'Animali', 'Altro',
];

const opzioniFormato = [
  '50 g', '100 g', '250 g', '500 g', '1 kg', '2 kg',
  '100 ml', '250 ml', '500 ml', '75 cl', '1 L', '1,5 L', '2 L',
  'confezione da 6', 'confezione da 12', 'bottiglia', 'lattina', 'brick',
  'scatola', 'busta', 'vaschetta', 'barattolo',
];

const opzioniPosizione = [
  'Scaffale A1', 'Scaffale A2', 'Scaffale B1', 'Scaffale B2', 'Scaffale C1',
  'Box 1', 'Box 2', 'Magazzino 1', 'Magazzino 2', 'Deposito',
];

const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const submitError = ref('');

onMounted(async () => {
  if (!isEdit.value) {
    try {
      form.codice = await getNextCode();
    } catch {
      form.codice = 'ART-001';
    }
    loading.value = false;
    return;
  }
  try {
    const p = await getProduct(route.params.id);
    Object.assign(form, {
      codice: p.codice,
      codiceABarre: p.codiceABarre ?? '',
      nome: p.nome,
      descrizione: p.descrizione ?? '',
      categoria: p.categoria ?? '',
      quantita: p.quantita ?? 0,
      unita: p.unita ?? 'pz',
      formato: p.formato ?? '',
      prezzoUnitario: p.prezzoUnitario ?? 0,
      sogliaMinima: p.sogliaMinima ?? 0,
      posizione: p.posizione ?? '',
    });
  } catch (e) {
    loadError.value = e.message || 'Prodotto non trovato';
  } finally {
    loading.value = false;
  }
});

async function submit() {
  submitError.value = '';
  saving.value = true;
  try {
    const body = {
      codice: form.codice.trim(),
      codiceABarre: (form.codiceABarre || '').trim(),
      nome: form.nome.trim(),
      descrizione: (form.descrizione || '').trim(),
      categoria: (form.categoria || '').trim(),
      quantita: Number(form.quantita) || 0,
      unita: (form.unita || 'pz').trim(),
      formato: (form.formato || '').trim(),
      prezzoUnitario: Number(form.prezzoUnitario) || 0,
      sogliaMinima: Number(form.sogliaMinima) || 0,
      posizione: (form.posizione || '').trim(),
    };
    if (isEdit.value) {
      await updateProduct(route.params.id, body);
      router.push('/prodotti/' + route.params.id);
    } else {
      const created = await createProduct(body);
      router.push('/prodotti/' + created._id);
    }
  } catch (e) {
    submitError.value = e.message || 'Errore durante il salvataggio';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.product-form {
  max-width: 700px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.span-2 {
  grid-column: span 2;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.submit-error {
  margin-top: 1rem;
  color: var(--danger);
  font-size: 0.9rem;
}

.input-with-scan {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-with-scan input {
  flex: 1;
}

.scan-btn {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
