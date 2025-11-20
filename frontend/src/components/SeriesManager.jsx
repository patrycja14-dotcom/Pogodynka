// frontend/src/components/SeriesManager.jsx
import React, { useState } from 'react';
import { createSeries, updateSeries, deleteSeries } from '../api';

export default function SeriesManager({ series, onReload }) {
  const empty = {
    id: null,
    name: '',
    description: '',
    min_value: 0,
    max_value: 50,
    color: '#ff0000',
    icon: 'circle',
  };

  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description || '',
      min_value: s.min_value,
      max_value: s.max_value,
      color: s.color,
      icon: s.icon || 'circle',
    });
    setError('');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const min = parseFloat(form.min_value);
    const max = parseFloat(form.max_value);
    if (isNaN(min) || isNaN(max)) {
      setError('Min i max muszą być liczbami.');
      return;
    }
    if (min > max) {
      setError('min_value nie może być większe od max_value');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      min_value: min,
      max_value: max,
      color: form.color,
      icon: form.icon,
    };

    try {
      if (form.id) {
        await updateSeries(form.id, payload);
      } else {
        await createSeries(payload);
      }
      setForm(empty);
      onReload();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu serii');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Usunąć serię wraz z jej pomiarami?')) return;
    try {
      await deleteSeries(id);
      if (form.id === id) setForm(empty);
      onReload();
    } catch (err) {
      console.error(err);
      setError('Błąd usuwania serii');
    }
  };

  return (
    <div className="admin-section">
      <h3>Serie pomiarowe</h3>
      <div className="admin-content">
        <div className="admin-list">
          <ul>
            {series.map((s) => (
              <li key={s.id}>
                <span style={{ borderLeft: `4px solid ${s.color}`, paddingLeft: 6 }}>
                  {s.name} [{s.min_value} – {s.max_value} °C]
                </span>
                <button type="button" onClick={() => handleEdit(s)}>
                  Edytuj
                </button>
                <button type="button" onClick={() => handleDelete(s.id)}>
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <h4>{form.id ? 'Edycja serii' : 'Nowa seria'}</h4>
          <input
            type="text"
            placeholder="Nazwa"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
          <textarea
            placeholder="Opis"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Min"
            value={form.min_value}
            onChange={(e) => handleChange('min_value', e.target.value)}
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Max"
            value={form.max_value}
            onChange={(e) => handleChange('max_value', e.target.value)}
            required
          />
          <label>Kolor:</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => handleChange('color', e.target.value)}
          />
          <input
            type="text"
            placeholder="Ikona"
            value={form.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
          />
          <button type="submit">
            {form.id ? 'Zapisz zmiany' : 'Dodaj serię'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}