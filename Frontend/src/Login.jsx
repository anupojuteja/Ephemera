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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[rgba(255,255,255,0.02)] p-6 rounded-xl shadow-neon">
        <h2 className="text-2xl font-bold mb-4" style={{background: "linear-gradient(90deg,#F58529,#DD2A7B)", WebkitBackgroundClip: "text", color: "transparent"}}>Welcome back</h2>
        <p className="muted mb-4">Log in to continue to Ephemera</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]" placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input className="w-full p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]" placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 rounded-xl text-white" style={{background: "linear-gradient(90deg,#DD2A7B,#8134AF)"}}>Sign in</button>
        </form>

        {err && <div className="text-red-400 mt-3">{err}</div>}

        <div className="mt-4 text-sm muted">New? Use the backend register endpoint or create user via admin.</div>
      </div>
    </div>
  );
}
