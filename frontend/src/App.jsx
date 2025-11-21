// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import LoginPanel from './components/LoginPanel';

export default function App() {
  const [token, setToken] = useState(null);

  // przy starcie spróbuj odczytać token z localStorage
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  const handleLoginSuccess = (token, user) => {
    // token i user są już zapisywane w api.login, ale dla pewności:
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
    }
  };

  // Na razie ZAWSZE pokazujemy ekran logowania
  // (później można tu dodać AdminPanel, jak logowanie będzie działać)
  return (
    <div>
      <LoginPanel onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}