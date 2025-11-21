// src/App.jsx
import { useState, useEffect } from 'react';
import LoginPanel from './components/LoginPanel.jsx';
import AdminPanel from './components/AdminPanel.jsx';

export default function App() {
  const [logged, setLogged] = useState(false);

  // sprawdzamy token przy starcie aplikacji
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLogged(true);
    }
  }, []);

  // callback po poprawnym logowaniu
  const handleLoginSuccess = () => {
    setLogged(true);
  };

  return (
    <div>
      {logged ? (
        <AdminPanel />
      ) : (
        <LoginPanel onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}