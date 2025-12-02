import React, { useEffect, useState } from "react";
import Login from "./Login";
import Chat from "./Chat";
import Header from "./Header";
import api from "./api";

/*
  Simple flow:
  - Login / register via backend
  - Enter other user's numeric ID to start a chat
*/

export default function App() {
  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const user = await api.me();
          setMe(user);
        } catch (e) {
          console.error("not logged in");
        }
      }
    }
    loadMe();
  }, []);

  if (!me) {
    return (
      <>
        <Header />
        <Login onLogin={(u)=>setMe(u)} />
      </>
    );
  }

    if (!other) {
    return (
      <div className="min-h-screen flex flex-col bg-[transparent]">
        <Header me={me} onLogout={() => { setMe(null); setOther(null); }} />

        {/* Centered content area - keeps background full but card centered */}
        <main className="flex-1 flex items-start justify-center pt-28 pb-12 px-4">
          <div className="w-full max-w-2xl bg-[rgba(255,255,255,0.02)] p-8 rounded-2xl shadow-neon border border-[rgba(255,255,255,0.03)]">
            <h1 className="text-4xl font-bold mb-4">
              Welcome, <span style={{background: "linear-gradient(90deg,#F58529,#DD2A7B)", WebkitBackgroundClip: "text", color: "transparent"}}>{me.username}</span>
            </h1>

            <p className="muted mb-4">Start a chat — for demo enter another user's numeric ID (create users via admin or register endpoint)</p>

            <div className="flex items-center gap-3 mb-3">
              <input id="otherId" placeholder="other user id" className="p-3 rounded-lg flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]" />
              <button onClick={async ()=>{
                const v = document.getElementById("otherId").value.trim();
                setError("");
                if (!v) { setError("enter user id"); return; }
                try {
                  const room = await api.roomWith(Number(v));
                  // to render Chat we need other user's minimal info
                  setOther({ id: Number(v), username: `user-${v}`});
                } catch (e) {
                  console.error(e);
                  setError("Cannot start chat — check user id or login");
                }
              }} className="px-4 py-2 rounded-xl text-white" style={{background: "linear-gradient(90deg,#DD2A7B,#8134AF)"}}>Start Chat</button>
            </div>

            {error && <div className="text-red-400 mb-3">{error}</div>}

            <div className="muted text-sm">Tip: create users via backend: <code>/api/auth/register/</code> or Django admin.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header me={me} onLogout={() => { setMe(null); setOther(null); }} />
      <div className="flex-1 flex">
        <div className="w-full max-w-4xl mx-auto flex gap-6 p-6">
          <Chat me={me} otherUser={other} />
        </div>
      </div>
    </div>
  );
}
