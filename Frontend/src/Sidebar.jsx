import React, { useEffect, useState } from "react";
import api from "./api";

/*
 Sidebar:
 - search input
 - list of rooms/friends (we show simple list using API)
 - clicking a row calls onOpenRoom(room, otherUser)
*/

export default function Sidebar({ me, onOpenRoom }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    loadList();
    // basic polling to refresh list
    const id = setInterval(loadList, 5000);
    return () => clearInterval(id);
  }, []);

  async function loadList() {
    try {
      // For now fetch friend requests or show users (minimal)
      const resp = await api.listFriends(); // expects /api/friends/ - adapt if different
      // If API returns friendRequests, map to list items; else fallback to users
      if (Array.isArray(resp)) setList(resp);
    } catch (e) {
      // fallback: show a few placeholder entries if API not present
      setList((prev) => prev.length ? prev : [
        { id: 2, username: "teja" },
        { id: 3, username: "tez" },
        { id: 4, username: "jk" }
      ]);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4">
        <div className="relative">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="w-full p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]" />
          <div className="absolute right-3 top-3 text-muted">🔍</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-[rgba(255,255,255,0.02)]">
          {list.map((u) => (
            <li key={u.id} className="px-4 py-3 hover:bg-[rgba(255,255,255,0.01)] cursor-pointer flex items-center gap-3"
                onClick={async ()=>{
                  try {
                    const room = await api.roomWith(u.id);
                    onOpenRoom(room, { id: u.id, username: u.username || `user-${u.id}` });
                  } catch (e) {
                    // fallback: open a fake room object
                    onOpenRoom({ id: `r-${u.id}`}, { id: u.id, username: u.username || `user-${u.id}`});
                  }
                }}>
              <div className="avatar-ring"><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=515BD4&color=fff`} alt="" className="w-12 h-12 rounded-full" /></div>
              <div className="flex-1">
                <div className="font-semibold">{u.username}</div>
                <div className="muted small">Hey there — say hello!</div>
              </div>
              <div className="text-xs muted">13:02</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.02)]">
        <button className="w-full py-2 rounded-lg text-sm" style={{background: "linear-gradient(90deg,#DD2A7B,#8134AF)"}}>New Chat</button>
      </div>
    </div>
  );
}
