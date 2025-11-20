// src/api.js

// Bazowy URL API – z env albo lokalnie
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
 * POST /auth/login
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

  if (!data.token) {
    throw new Error('Brak tokenu w odpowiedzi serwera');
  }

  // zapis tokenu + opcjonalnie usera
  localStorage.setItem('token', data.token);
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * SERIE
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
 * POMIARY
 * GET /measurements
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

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}

/**
 * TWORZENIE POMIARU
 * POST /measurements
 */
export async function createMeasurement(payload) {
  const res = await fetch(`${API_URL}/measurements`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Błąd tworzenia pomiaru');
  }

  return res.json();
}

/**
 * AKTUALIZACJA POMIARU
 * PUT /measurements/:id
 */
export async function updateMeasurement(id, payload) {
  const res = await fetch(`${API_URL}/measurements/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Błąd aktualizacji pomiaru');
  }

  return res.json();
}

/**
 * USUWANIE POMIARU
 * DELETE /measurements/:id
 */
export async function deleteMeasurement(id) {
  const res = await fetch(`${API_URL}/measurements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Błąd usuwania pomiaru');
  }

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}