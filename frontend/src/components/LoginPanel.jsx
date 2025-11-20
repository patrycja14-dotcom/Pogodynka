import { useState } from "react";

export default function LoginPanel({ onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  function submit(e) {
    e.preventDefault();
    onLogin(login, password);
  }

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Zaloguj</button>
        </form>
      </div>
    </div>
  );
}