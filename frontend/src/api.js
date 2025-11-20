// src/api.js

// lokalnie będzie http://localhost:4000/api
// na serwerze ustawiamy VITE_API_BASE_URL w panelu Render
const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// --------------------------------------------------
// POMOCNICZO – token JWT trzymamy w localStorage
// --------------------------------------------------

export function saveToken(token) {
  localStorage.setItem('authToken', token);
}

export function getToken() {
  return localStorage.getItem('authToken');
}

export function clearToken() {
  localStorage.removeItem('authToken');
}

// mały helper do zapytań wymagających autoryzacji
async function authRequest(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // przy DELETE często jest 204 bez body
  if (res.status === 204) return;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Błąd żądania');
  }

  return res.json();
}

// --------------------------------------------------
// PUBLICZNA CZĘŚĆ – wykres i tabela
// --------------------------------------------------

// pobieranie serii pomiarowych
export async function fetchSeries() {
  const res = await fetch(`${API_URL}/series`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Błąd pobierania serii');
  }

  return res.json();
}

// pobieranie pomiarów z filtrami
export async function fetchMeasurements({ seriesIds, from, to }) {
  const params = new URLSearchParams();

  if (seriesIds && seriesIds.length > 0) {
    params.append('seriesId', seriesIds.join(','));
  }

  // zamiana daty z <input type="datetime-local"> na ISO
  if (from) {
    params.append('from', new Date(from).toISOString());
  }
  if (to) {
    params.append('to', new Date(to).toISOString());
  }

  const url = `${API_URL}/measurements?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Błąd pobierania pomiarów');
  }

  return res.json();
}

// --------------------------------------------------
// LOGOWANIE ADMINA
// --------------------------------------------------

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Błędny login lub hasło');
  }

  const data = await res.json();
  // zakładam, że backend zwraca { token: '...' }
  if (data.token) {
    saveToken(data.token);
  }

  return data;
}

// --------------------------------------------------
// ADMIN – SERIE POMIAROWE
// --------------------------------------------------

// POST /api/series
export function createSeries(payload) {
  return authRequest('/series', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// PUT /api/series/:id
export function updateSeries(id, payload) {
  return authRequest(`/series/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// DELETE /api/series/:id
export async function deleteSeries(id) {
  await authRequest(`/series/${id}`, {
    method: 'DELETE',
  });
}

// --------------------------------------------------
// ADMIN – POMIARY (dla MeasurementsManager, jeśli używasz)
// --------------------------------------------------

// POST /api/measurements
export function createMeasurement(payload) {
  return authRequest('/measurements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// PUT /api/measurements/:id
export function updateMeasurement(id, payload) {
  return authRequest(`/measurements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// DELETE /api/measurements/:id
export async function deleteMeasurement(id) {
  await authRequest(`/measurements/${id}`, {
    method: 'DELETE',
  });
}