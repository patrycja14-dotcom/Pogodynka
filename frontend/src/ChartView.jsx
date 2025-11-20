// src/ChartView.jsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from 'recharts';

export default function ChartView({ measurements, series }) {
  if (!measurements.length) {
    return (
      <div className="chart-container">
        <h2>Wykres temperatury</h2>
        <p>Brak danych do wyświetlenia.</p>
      </div>
    );
  }

  // Na razie rysujemy wszystkie punkty jako jedną linię (jedna temperatura)
  const data = measurements.map(m => ({
    timestamp: new Date(m.timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: m.value
  }));

  return (
    <div className="chart-container">
      <h2>Wykres temperatury w czasie</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Temperatura"
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}