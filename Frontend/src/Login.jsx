import React, { useState } from "react";
import api from "./api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.login(username, password);
      const me = await api.me();
      onLogin(me);
    } catch (e) {
      console.error(e);
      setErr("Login failed. Check credentials.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </div>
  );
}
