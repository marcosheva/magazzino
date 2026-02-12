import { getToken, clearToken } from './auth.js';

const BASE = '/api/products';

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

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(BASE + (qs ? '?' + qs : ''));
}

export async function getProduct(id) {
  return request(BASE + '/' + id);
}

export async function getStats() {
  return request(BASE + '/stats/summary');
}

export async function getNextCode() {
  const data = await request(BASE + '/next-code');
  return data.nextCode;
}

export async function createProduct(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) });
}

export async function updateProduct(id, body) {
  return request(BASE + '/' + id, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteProduct(id) {
  return request(BASE + '/' + id, { method: 'DELETE' });
}
