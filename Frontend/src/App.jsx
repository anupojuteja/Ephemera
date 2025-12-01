import React, { useEffect, useState } from "react";
import Login from "./Login";
import Chat from "./Chat";
import api from "./api";

/*
  Simple flow:
  - Login
  - Minor demo: start chat with a hard-coded user (or choose first user from friends)
  For demo, you can create users via Django admin or register then use another browser/incognito to create another account.
*/

export default function App() {
  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);

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
    return <Login onLogin={(u) => setMe(u)} />;
  }

  // Demo: show simple UI to pick another user id to chat with.
  if (!other) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Welcome, {me.username}</h2>
        <p>Start a chat — for demo enter another user's ID (create extra users via /admin or register endpoint)</p>
        <StartChatForm onStart={(u) => setOther(u)} me={me} />
      </div>
    );
  }

  return <Chat me={me} otherUser={other} />;
}

function StartChatForm({ onStart, me }) {
  const [otherId, setOtherId] = useState("");
  const [err, setErr] = useState("");
  async function go() {
    setErr("");
    try {
      // fetch user via a trivial trick: hit room-with to check user exists
      // but we'll try to create the room to validate existence
      const room = await api.roomWith(Number(otherId));
      // API response does not return full other user, so we craft dummy object
      const other = { id: Number(otherId), username: `user-${otherId}` };
      onStart(other);
    } catch (e) {
      setErr("Cannot start chat — check user id or login");
    }
  }
  return (
    <div>
      <input placeholder="other user id" value={otherId} onChange={(e) => setOtherId(e.target.value)} />
      <button onClick={go}>Start Chat</button>
      {err && <div style={{ color: "red" }}>{err}</div>}
      <div style={{ marginTop: 10 }}>
        Tip: create users via backend: <code>POST /api/auth/register/</code> or Django admin.
      </div>
    </div>
  );
}
