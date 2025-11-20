// frontend/src/components/MeasurementsManager.jsx
import React, { useState } from 'react';
import {
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../api';

export default function MeasurementsManager({ series, measurements, onReload }) {
  const [form, setForm] = useState({
    id: null,
    series_id: '',
    timestamp: '',
    value: '',
  });
  const [error, setError] = useState('');

  const seriesMap = Object.fromEntries(series.map((s) => [s.id, s]));

  const handleEdit = (m) => {
    setForm({
      id: m.id,
      series_id: m.series_id,
      timestamp: m.timestamp.slice(0, 16),
      value: m.value,
    });
    setError('');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const s = seriesMap[form.series_id];
    if (!s) {
      setError('Wybierz serię');
      return;
    }

    const val = parseFloat(form.value);
    if (isNaN(val)) {
      setError('Wartość musi być liczbą');
      return;
    }

    if (val < s.min_value || val > s.max_value) {
      setError(`Wartość poza zakresem [${s.min_value}, ${s.max_value}]`);
      return;
    }

    const payload = {
      series_id: form.series_id,
      timestamp: form.timestamp,
      value: val,
    };

    try {
      if (form.id) {
        await updateMeasurement(form.id, payload);
      } else {
        await createMeasurement(payload);
      }
      setForm({ id: null, series_id: '', timestamp: '', value: '' });
      onReload();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu pomiaru');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Usunąć ten pomiar?')) return;
    try {
      await deleteMeasurement(id);
      if (form.id === id) {
        setForm({ id: null, series_id: '', timestamp: '', value: '' });
      }
      onReload();
    } catch (err) {
      console.error(err);
      setError('Błąd usuwania pomiaru');
    }
  };

  return (
    <div className="admin-section">
      <h3>Pomiary</h3>
      <div className="admin-content">
        <div className="admin-list">
          <table className="data-table small-table">
            <thead>
              <tr>
                <th>Czas</th>
                <th>Seria</th>
                <th>Wartość [°C]</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {measurements.slice(0, 50).map((m) => {
                const s = seriesMap[m.series_id];
                return (
                  <tr key={m.id}>
                    <td>{new Date(m.timestamp).toLocaleString('pl-PL')}</td>
                    <td>{s ? s.name : m.series_id}</td>
                    <td>{m.value.toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => handleEdit(m)}>
                        Edytuj
                      </button>
                      <button type="button" onClick={() => handleDelete(m.id)}>
                        Usuń
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <small>Wyświetlane maks. 50 pomiarów.</small>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <h4>{form.id ? 'Edycja pomiaru' : 'Nowy pomiar'}</h4>
          <label>Seria:</label>
          <select
            value={form.series_id}
            onChange={(e) =>
              handleChange('series_id', parseInt(e.target.value, 10))
            }
            required
          >
            <option value="">-- wybierz serię --</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} [{s.min_value} – {s.max_value}]
              </option>
            ))}
          </select>

          <label>Czas:</label>
          <input
            type="datetime-local"
            value={form.timestamp}
            onChange={(e) => handleChange('timestamp', e.target.value)}
            required
          />

          <label>Wartość [°C]:</label>
          <input
            type="number"
            step="0.1"
            value={form.value}
            onChange={(e) => handleChange('value', e.target.value)}
            required
          />

          <button type="submit">
            {form.id ? 'Zapisz zmiany' : 'Dodaj pomiar'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}