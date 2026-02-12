import { getToken, clearToken } from './auth.js';

const BASE = '/api/movements';

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

export async function getMovements(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(BASE + (qs ? '?' + qs : ''));
}

export async function createMovement(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) });
}
