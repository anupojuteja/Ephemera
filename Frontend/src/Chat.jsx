import React, { useEffect, useState, useRef } from "react";
import api from "./api";

/*
 Chat center column:
 - If no room selected, show a friendly empty state
 - Otherwise show messages + input
 - Polls every 2s for new messages
*/

export default function Chat({ me, room, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const pollRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!room) {
      setMessages([]);
      return;
    }
    async function load() {
      try {
        const msgs = await api.listMessages(room.id);
        setMessages(msgs);
        setTimeout(()=> scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth"}), 60);
      } catch (e) {
        // fallback keep previous
      }
    }
    load();
    pollRef.current = setInterval(load, 2000);
    return () => clearInterval(pollRef.current);
  }, [room]);

  async function sendText(e) {
    e.preventDefault();
    if (!text.trim() || !room) return;
    await api.sendText(room.id, text);
    setText("");
    const msgs = await api.listMessages(room.id);
    setMessages(msgs);
  }

  async function sendImage(e) {
    e.preventDefault();
    if (!file || !room) return;
    await api.sendImage(room.id, file);
    setFile(null);
    const msgs = await api.listMessages(room.id);
    setMessages(msgs);
  }

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select a chat to start messaging</h2>
          <p className="muted">Your conversations will appear here. Try selecting a user on the left or create a new chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.03)] flex items-center gap-4">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.username||"User")}&background=515BD4&color=fff`} alt="o" className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-semibold">{otherUser?.username || "Chat"}</div>
          <div className="muted small">Active now</div>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-auto p-6 space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.00),rgba(255,255,255,0.01))]">
        {messages.map((m) => {
          const mine = m.sender && m.sender.id === me.id;
          return (
            <div key={m.id || Math.random()} className={`max-w-[70%] ${mine ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
              <div className={`inline-block p-3 rounded-2xl ${mine ? 'bubble-me' : 'bubble-other'} shadow-sm`}>
                {m.text && <div className="mb-2">{m.text}</div>}
                {m.image_url && <img src={m.image_url} alt="img" className="max-w-[300px] rounded-lg" />}
                <div className="text-[11px] muted mt-2">{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]">
        <form onSubmit={sendText} className="flex items-center gap-3">
          <input className="flex-1 p-3 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]" placeholder="Write a message" value={text} onChange={(e)=>setText(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} className="hidden" id="imgfile" />
          <label htmlFor="imgfile" className="px-3 py-2 rounded-full bg-[rgba(255,255,255,0.03)] cursor-pointer">📎</label>
          <button type="submit" className="px-4 py-2 rounded-full text-white" style={{background: "linear-gradient(90deg,#DD2A7B,#8134AF)"}}>Send</button>
        </form>

        {file && (
          <form onSubmit={sendImage} className="mt-2 flex items-center gap-3">
            <div className="text-sm muted">Image ready to upload: {file.name}</div>
            <button type="submit" className="ml-auto px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)]">Upload</button>
          </form>
        )}
      </div>
    </div>
  );
}
