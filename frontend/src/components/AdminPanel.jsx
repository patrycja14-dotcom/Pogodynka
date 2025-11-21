// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SeriesManager from './SeriesManager.jsx';
import MeasurementsManager from './MeasurementsManager.jsx';
import { fetchSeries, fetchMeasurements } from '../api';

export default function AdminPanel() {
  const [tab, setTab] = useState('series');
  const [series, setSeries] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const seriesData = await fetchSeries();
      const measurementsData = await fetchMeasurements({});
      setSeries(seriesData || []);
      setMeasurements(measurementsData || []);
    } catch (err) {
      console.error('Błąd ładowania danych w AdminPanel:', err);
      setError(err.message || 'Błąd ładowania danych');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="admin-panel">
      <h2>Panel administratora</h2>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'series' ? 'active' : ''}
          onClick={() => setTab('series')}
        >
          Serie
        </button>
        <button
          type="button"
          className={tab === 'measurements' ? 'active' : ''}
          onClick={() => setTab('measurements')}
        >
          Pomiary
        </button>
      </div>

      {loading && <p>Ładowanie danych...</p>}
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {tab === 'series' && (
            <SeriesManager series={series} onReload={loadData} />
          )}

          {tab === 'measurements' && (
            <MeasurementsManager
              series={series}
              measurements={measurements}
              onReload={loadData}
            />
          )}
        </>
      )}
    </div>
  );
}