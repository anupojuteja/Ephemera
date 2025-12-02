import React, { useEffect, useState, useRef } from "react";
import api from "./api";

export default function Chat({ me, otherUser }) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const pollRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    async function createRoom() {
      try {
        const data = await api.roomWith(otherUser.id);
        setRoom(data);
      } catch (e) {
        console.error(e);
      }
    }
    createRoom();
    return () => {};
  }, [otherUser]);

  useEffect(() => {
    if (!room) return;
    async function load() {
      try {
        const msgs = await api.listMessages(room.id);
        setMessages(msgs);
        // scroll to bottom
        setTimeout(()=> scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth"}), 80);
      } catch (e) {
        console.error("poll error", e);
      }
    }
    load();
    pollRef.current = setInterval(load, 2000);
    return () => {
      clearInterval(pollRef.current);
      api.vanish(room.id).catch((e)=>console.error("vanish",e));
    };
  }, [room]);

  async function handleSendText(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.sendText(room.id, text);
      setText("");
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
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-4">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.username)}&background=8134AF&color=fff`} alt="o" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold">{otherUser.username}</div>
            <div className="muted small">Active now</div>
          </div>
        </div>

        <div ref={scrollerRef} className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map(m => {
            const mine = m.sender && m.sender.id === me.id;
            return (
              <div key={m.id} className={`max-w-[70%] ${mine ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
                <div className={`inline-block p-3 rounded-xl ${mine ? 'bubble-me' : 'bubble-other'}`}>
                  {m.text && <div className="mb-2">{m.text}</div>}
                  {m.image_url && <img src={m.image_url} alt="img" className="max-w-[240px] rounded-lg" />}
                  <div className="text-[11px] muted mt-2">{new Date(m.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]">
          <form onSubmit={handleSendText} className="flex items-center gap-3">
            <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" className="flex-1 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]" />
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} className="text-sm" />
            <button type="submit" className="px-4 py-2 rounded-xl text-white" style={{background: "linear-gradient(90deg,#DD2A7B,#8134AF)"}}>Send</button>
          </form>
          <form onSubmit={handleSendImage} className="mt-2 hidden" />
        </div>
      </div>
    </div>
  );
}
