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
      <div className="max-w-md w-full card p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-white">Welcome back</h2>
        <p className="muted mb-6">Log in to continue to Ephemera</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">Sign in</button>
        </form>

        {err && <div className="text-red-400 mt-3">{err}</div>}

        <div className="mt-4 text-sm muted">New? Use the backend register endpoint or create user via admin.</div>
      </div>
    </div>
  );
}
