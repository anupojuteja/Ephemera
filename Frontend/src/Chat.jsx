import React, { useEffect, useState, useRef } from "react";
import api from "./api";

/*
  Minimal chat UI:
  - Polls messages every 2s
  - Shows text + image
  - On unmount calls vanish(roomId) to delete ephemeral messages
*/

export default function Chat({ me, otherUser }) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    async function createRoom() {
      const data = await api.roomWith(otherUser.id);
      setRoom(data);
    }
    createRoom();
    return () => {};
  }, [otherUser]);

  // polling
  useEffect(() => {
    if (!room) return;
    async function load() {
      try {
        const msgs = await api.listMessages(room.id);
        setMessages(msgs);
      } catch (e) {
        console.error("poll error", e);
      }
    }
    load();
    pollRef.current = setInterval(load, 2000);
    return () => {
      clearInterval(pollRef.current);
      // call vanish when leaving chat to delete ephemeral messages
      api.vanish(room.id).catch((e) => console.error("vanish failed", e));
    };
  }, [room]);

  async function handleSendText(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.sendText(room.id, text);
      setText("");
      // immediately reload once
      const msgs = await api.listMessages(room.id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSendImage(e) {
    e.preventDefault();
    if (!file) return;
    try {
      await api.sendImage(room.id, file);
      setFile(null);
      const msgs = await api.listMessages(room.id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Chat with {otherUser.username}</h3>
      {!room ? (
        <div>Creating room...</div>
      ) : (
        <>
          <div style={{ border: "1px solid #ddd", height: 400, overflow: "auto", padding: 10 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#555" }}>
                  <strong>{m.sender.username}</strong> — {new Date(m.created_at).toLocaleTimeString()}
                </div>
                {m.text && <div>{m.text}</div>}
                {m.image_url && (
                  <div>
                    <img src={m.image_url} alt="msg" style={{ maxWidth: 250 }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendText} style={{ marginTop: 10 }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" style={{ width: "70%" }} />
            <button type="submit">Send</button>
          </form>

          <form onSubmit={handleSendImage} style={{ marginTop: 10 }}>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            <button type="submit">Send Image</button>
          </form>
        </>
      )}
    </div>
  );
}
