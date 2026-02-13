import { getToken, clearToken } from './auth.js';

const BASE = '/api/cassa';

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: 'Bearer ' + token } : {};
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Sessione scaduta');
  }
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function getCassaMovements() {
  return request(BASE);
}

export async function getCassaSaldo() {
  const data = await request(BASE + '/saldo');
  return data.saldo;
}

export async function getCassaMovement(id) {
  return request(BASE + '/' + id);
}

export async function createCassaMovement(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) });
}

export async function updateCassaMovement(id, body) {
  return request(BASE + '/' + id, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteCassaMovement(id) {
  return request(BASE + '/' + id, { method: 'DELETE' });
}
