// frontend/src/LoginPage.jsx
import React, { useState } from "react";
import { login } from "./api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError("Niepoprawne dane logowania");
    }
  };

  return (
    <div className="login-box">
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Zaloguj</button>
      </form>

      {error && <p className="login-error">{error}</p>}
    </div>
  );
}