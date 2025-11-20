// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import ChartView from './ChartView';
import LoginPanel from './components/LoginPanel';
import AdminPanel from './components/AdminPanel';

const API_URL = 'http://localhost:4000/api';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [activeView, setActiveView] = useState('user'); // 'user' | 'admin'

  // --------------------------
  // 1. Sprawdzenie czy mamy token w localStorage
  // --------------------------
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setLoading(false);
    } catch (e) {
      console.error('Błąd parsowania usera z localStorage', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, []);

  // --------------------------
  // 2. Logowanie
  // --------------------------
  async function handleLogin({ username, password }) {
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || 'Nieprawidłowe dane logowania';
        throw new Error(msg);
      }

      const data = await res.json();
      // data: { token, user: { id, username, role } }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setActiveView('user');
    } catch (e) {
      console.error(e);
      setLoginError(e.message || 'Błąd logowania');
    }
  }

  // --------------------------
  // 3. Wylogowanie
  // --------------------------
  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveView('user');
  }

  // --------------------------
  // 4. Ekran ładowania
  // --------------------------
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Ładowanie aplikacji...</p>
      </div>
    );
  }

  // --------------------------
  // 5. Jeśli nie ma tokena – ekran logowania
  // --------------------------
  if (!token || !user) {
    return (
      <div className="login-page">
        <LoginPanel onLogin={handleLogin} error={loginError} />
      </div>
    );
  }

  // --------------------------
  // 6. Główny widok po zalogowaniu
  // --------------------------
  const isAdmin = user.role === 'admin';

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Pomiary temperatury</h1>
          <p className="app-subtitle">
            System wizualizacji danych temperatury z czujników
          </p>
        </div>
        <div className="app-header-right">
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role">
              {isAdmin ? 'administrator' : 'użytkownik'}
            </span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={
            activeView === 'user'
              ? 'nav-button nav-button-active'
              : 'nav-button'
          }
          onClick={() => setActiveView('user')}
        >
          Widok użytkownika
        </button>

        {isAdmin && (
          <button
            className={
              activeView === 'admin'
                ? 'nav-button nav-button-active'
                : 'nav-button'
            }
            onClick={() => setActiveView('admin')}
          >
            Panel administracyjny
          </button>
        )}
      </nav>

      <main className="app-main">
        {activeView === 'user' && <ChartView />}
        {activeView === 'admin' && isAdmin && <AdminPanel />}
        {activeView === 'admin' && !isAdmin && (
          <p>Brak uprawnień do panelu administracyjnego.</p>
        )}
      </main>
    </div>
  );
}

export default App;