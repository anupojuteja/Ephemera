import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import RightPanel from "./RightPanel";
import Login from "./Login";
import api from "./api";

/*
  WhatsApp-like main app:
  - fixed top header
  - 3-column layout: contacts | chat | info
*/

export default function App() {
  const [me, setMe] = useState(null);
  const [active, setActive] = useState({ room: null, user: null });

  useEffect(() => {
    async function loadMe() {
      try {
        const user = await api.me();
        setMe(user);
      } catch (e) {
        setMe(null);
      }
    }
    loadMe();
  }, []);

  if (!me) {
    return (
      <div className="min-h-screen bg-wa-bg text-slate-900">
        <Header me={null} />
        <Login onLogin={(u) => setMe(u)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wa-bg text-slate-900">
      <Header me={me} onLogout={() => { try { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); } catch{}; setMe(null); }} />

      <div className="pt-16 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ height: "78vh" }}>
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-3 border-r">
              <Sidebar me={me} onOpen={(room, user)=>setActive({room,user})} />
            </div>

            <div className="col-span-6">
              <Chat me={me} room={active.room} otherUser={active.user} />
            </div>

            <div className="col-span-3 border-l bg-slate-50">
              <RightPanel me={me} room={active.room} otherUser={active.user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
