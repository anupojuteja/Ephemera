// frontend/src/Sidebar.jsx
import React, { useEffect, useState } from "react";
import api from "./api";

/*
 Sidebar: uses api.getFriends() as the primary source.
 Normalizes the returned objects for the UI.
*/

export default function Sidebar({ me, onOpen }) {
  const [items, setItems] = useState([]); // normalized items
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadList();
    const id = setInterval(loadList, 10000); // refresh frequently but not too often
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadList() {
    setLoading(true);
    try {
      // Primary: use friends endpoint (works on your backend)
      const friends = await api.getFriends();
      if (Array.isArray(friends) && friends.length > 0) {
        const normalized = friends.map(f => {
          // friend could be simple user object or friend-request object.
          // try several common shapes:
          const user = f.user || f.to_user || f.from_user || f; // adapt to your payload
          return {
            id: user.id,
            username: user.username || user.name || user.email || `user-${user.id}`,
            avatar_url: user.avatar_url || null,
            last_message: f.last_message || null,   // if backend provides last_message on friend
            unread_count: f.unread_count || f.unread || 0
          };
        });
        setItems(normalized);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("getFriends failed", e);
    }

    // fallback: try rooms or users (less likely with your current API)
    try {
      const rooms = await api.getRooms();
      if (Array.isArray(rooms)) {
        const normalized = rooms.map(r => {
          const other = r.other_user || (r.participants && r.participants.find(p => p.id !== me?.id)) || r.other || {};
          return {
            id: r.id,
            username: other.username || other.name || `user-${other.id || r.id}`,
            avatar_url: other.avatar_url || null,
            last_message: r.last_message || null,
            unread_count: r.unread_count || 0
          };
        });
        setItems(normalized);
        setLoading(false);
        return;
      }
    } catch (e) {}

    try {
      const users = await api.getUsers();
      const normalizedUsers = (Array.isArray(users) ? users : []).map(u=>({
        id: u.id, username: u.username || u.name || `user-${u.id}`, avatar_url: u.avatar_url || null, last_message: null, unread_count: 0
      }));
      setItems(normalizedUsers);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = Array.isArray(items) ? items.filter(it => it.username && it.username.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search or start new chat" className="w-full p-2 rounded-md border text-sm" />
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No contacts found</div>
        ) : (
          <ul>
            {filtered.map(item => (
              <li key={item.id} className="px-3 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
                  onClick={async ()=>{
                    // when clicking a friend, create/open a room via roomWith
                    try {
                      const room = await api.roomWith(item.id);
                      onOpen(room, { id: item.id, username: item.username });
                    } catch (e) {
                      onOpen({ id: `tmp-${item.id}`}, { id: item.id, username: item.username });
                    }
                  }}>
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-none flex items-center justify-center text-slate-700 font-semibold">
                  {item.avatar_url ? <img src={item.avatar_url} alt="a" className="w-12 h-12 rounded-full object-cover" /> : (item.username||"U").slice(0,1).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.username}</div>
                    <div className="text-xs text-slate-400">{item.last_message?.created_at ? new Date(item.last_message.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ""}</div>
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                    {item.last_message?.text || "Say hello!"}
                  </div>
                </div>

                {item.unread_count > 0 && (
                  <div className="ml-2">
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">{item.unread_count}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t">
        <button onClick={loadList} className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm">Refresh</button>
      </div>
    </div>
  );
}
