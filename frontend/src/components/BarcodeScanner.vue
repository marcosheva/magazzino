<template>
  <div v-if="show" class="scanner-overlay" @click.self="close">
    <div class="scanner-modal card">
      <div class="scanner-header">
        <h3>Scansiona barcode</h3>
        <button type="button" class="btn btn-ghost" @click="close">✕</button>
      </div>
      <div id="scanner-container" class="scanner-container"></div>
      <p class="scanner-hint">Punta la camera verso il barcode</p>
    </div>
  </div>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['close', 'scanned']);

let html5QrCode = null;

function close() {
  stop();
  emit('close');
}

function stop() {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
    html5QrCode.clear();
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await start();
  } else {
    stop();
  }
});

async function start() {
  try {
    const { Html5Qrcode } = await import('html5-qrcode');
    html5QrCode = new Html5Qrcode('scanner-container');
    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [],
      },
      (decodedText) => {
        emit('scanned', decodedText);
        stop();
        close();
      },
      () => {}
    );
  } catch (err) {
    console.error('Errore scanner:', err);
  }
}

onUnmounted(() => {
  stop();
});
</script>

<style scoped>
.scanner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.scanner-modal {
  max-width: 500px;
  width: 100%;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scanner-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.scanner-container {
  width: 100%;
  min-height: 300px;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
}

.scanner-hint {
  margin-top: 0.75rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
