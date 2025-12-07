import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import RightPanel from "./RightPanel";
import api from "./api";
import "./index.css";

/*
  App: top header + 3-column layout
  - Sidebar: chat list
  - Chat: center message view
  - RightPanel: info, shared files
*/

export default function App() {
  const [me, setMe] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const user = await api.me();
          setMe(user);
        } catch (e) {
          // not logged in
          setMe(null);
        }
      }
    }
    loadMe();
  }, []);

  // Called by Sidebar when a room is selected
  function openRoom(room, otherUser) {
    setActiveRoom(room);
    setActiveUser(otherUser);
  }

  // If not logged in show the login (existing Login component)
  if (!me) {
    const Login = require("./Login").default;
    return (
      <>
        <Header />
        <Login onLogin={(u) => setMe(u)} />
      </>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-[#0b0710] to-[#0f0811] text-white">
      <Header me={me} onLogout={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); setMe(null); }} />

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] overflow-hidden shadow-neon border border-[rgba(255,255,255,0.04)]">
          <div className="grid grid-cols-12 gap-0 h-[78vh]">
            <div className="col-span-3 border-r border-[rgba(255,255,255,0.03)]">
              <Sidebar me={me} onOpenRoom={openRoom} />
            </div>

            <div className="col-span-6">
              {/* center chat */}
              <Chat me={me} room={activeRoom} otherUser={activeUser} />
            </div>

            <div className="col-span-3 border-l border-[rgba(255,255,255,0.03)]">
              <RightPanel me={me} otherUser={activeUser} room={activeRoom} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
