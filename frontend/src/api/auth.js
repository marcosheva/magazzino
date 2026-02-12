const AUTH_KEY = 'magazzino_token';

export function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

export function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export async function login(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login fallito');
  return data;
}
