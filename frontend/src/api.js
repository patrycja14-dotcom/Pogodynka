// src/api.js

// lokalnie będzie http://localhost:4000/api
// na serwerze ustawimy VITE_API_BASE_URL w panelu
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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