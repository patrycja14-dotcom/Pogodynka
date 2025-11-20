// frontend/src/components/AdminPanel.jsx
import React, { useState } from 'react';
import SeriesManager from './SeriesManager.jsx';
import MeasurementsManager from './MeasurementsManager.jsx';

export default function AdminPanel({ series, measurements, onReload }) {
  const [tab, setTab] = useState('series');

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

      {tab === 'series' && (
        <SeriesManager series={series} onReload={onReload} />
      )}
      {tab === 'measurements' && (
        <MeasurementsManager
          series={series}
          measurements={measurements}
          onReload={onReload}
        />
      )}
    </div>
  );
}