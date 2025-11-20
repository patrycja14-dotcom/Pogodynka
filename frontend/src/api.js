// src/api.js

// Usuwamy końcowy "/" z VITE_API_BASE_URL, jeśli ktoś go kiedyś dopisze
const API_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')) ||
  'http://localhost:4000/api';

// Pomocnicza funkcja do nagłówków z tokenem
function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/**
 * LOGOWANIE
 * Wywołuje: POST /auth/login
 * Body: { username, password }
 * Zapisuje token w localStorage
 */
export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    // jeśli brak JSON, zostawiamy pusty obiekt
  }

  if (!res.ok) {
    const message = data?.message || 'Błąd logowania';
    throw new Error(message);
  }

  // Oczekujemy, że backend zwróci co najmniej { token: '...' }
  if (!data.token) {
    throw new Error('Brak tokenu w odpowiedzi serwera');
  }

  // Zapis tokenu i ewentualnych danych użytkownika
  localStorage.setItem('token', data.token);
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * POBIERANIE SERII
 * GET /series
 */
export async function fetchSeries() {
  const res = await fetch(`${API_URL}/series`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Błąd pobierania serii');
  }

  return res.json();
}

/**
 * POBIERANIE POMIARÓW
 * GET /measurements
 * Query params: seriesId, from, to
 */
export async function fetchMeasurements({ seriesIds, from, to }) {
  const params = new URLSearchParams();

  if (seriesIds?.length) {
    params.append('seriesId', seriesIds.join(','));
  }
  if (from) {
    params.append('from', new Date(from).toISOString());
  }
  if (to) {
    params.append('to', new Date(to).toISOString());
  }

  const res = await fetch(`${API_URL}/measurements?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Błąd pobierania pomiarów');
  }

  return res.json();
}

/**
 * TWORZENIE SERII
 * POST /series
 * Body: { name, ... }
 */
export async function createSeries(payload) {
  const res = await fetch(`${API_URL}/series`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Błąd tworzenia serii');
  }

  return res.json();
}

/**
 * AKTUALIZACJA SERII
 * PUT /series/:id
 */
export async function updateSeries(id, payload) {
  const res = await fetch(`${API_URL}/series/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Błąd aktualizacji serii');
  }

  return res.json();
}

/**
 * USUWANIE SERII
 * DELETE /series/:id
 */
export async function deleteSeries(id) {
  const res = await fetch(`${API_URL}/series/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Błąd usuwania serii');
  }

  // Możliwe, że backend zwróci { success: true } albo 204 bez body.
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}