// src/components/LoginPanel.jsx
import React, { useState } from 'react';
import { login } from '../api';

function LoginPanel({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // bez tego formularz robi "hard reload"
    setError('');
    setLoading(true);

    try {
      const data = await login(username.trim(), password); // { token, user }

      // jeśli rodzic przekazuje callback – informujemy go o sukcesie
      if (onLoginSuccess) {
        onLoginSuccess(data.token, data.user);
      }

      // opcjonalne czyszczenie formularza po sukcesie
      setPassword('');
      // login zostawiamy, żeby było widać kto jest zalogowany
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Nie udało się zalogować');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-panel">
      <h2>Logowanie administratora</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="username">Login</label>
          <input
            id="username"
            type="text"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>

        <div className="form-row">
          <label htmlFor="password">Hasło</label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="error" style={{ color: 'red' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </button>
      </form>
    </div>
  );
}

export default LoginPanel;