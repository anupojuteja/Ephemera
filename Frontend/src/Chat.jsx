import React, { useEffect, useRef, useState } from "react";
import api from "./api";

/*
 Center chat column (WhatsApp style)
 - header (name + last seen)
 - messages area
 - input fixed at bottom of column
*/

export default function Chat({ me, room, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const pollRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!room) { setMessages([]); return; }
    let mounted = true;

    async function load() {
      try {
        const msgs = await api.listMessages(room.id);
        if (mounted) setMessages(msgs);
        setTimeout(()=> scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth"}), 60);
      } catch (e) {}
    }

    load();
    pollRef.current = setInterval(load, 2000);
    return () => { mounted=false; clearInterval(pollRef.current); };
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

  // empty state
  if (!room) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-full flex items-center justify-center text-center p-6 text-slate-500">
          <div>
            <div className="text-2xl font-semibold mb-2">Select a chat</div>
            <div>Messages will appear here</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">{(otherUser?.username||"U").slice(0,1).toUpperCase()}</div>
        <div className="flex-1">
          <div className="font-semibold">{otherUser?.username||"Chat"}</div>
          <div className="text-xs text-slate-500">last seen recently</div>
        </div>
        <div className="text-slate-500">⋯</div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-auto px-4 py-6 space-y-4 bg-[url('/bubble-bg.png')] bg-repeat" >
        {messages.map(m=>{
          const mine = m.sender && m.sender.id === me.id;
          return (
            <div key={m.id || Math.random()} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`${mine ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'} px-4 py-2 rounded-xl max-w-[70%]`}>
                {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                {m.image_url && <img src={m.image_url} className="mt-2 rounded-md max-w-full" alt="img" />}
                <div className="text-[11px] text-slate-400 mt-1 text-right">{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t bg-white">
        <form onSubmit={sendText} className="flex items-center gap-3">
          <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" className="flex-1 p-3 rounded-full border" />
          <input id="imgfile" type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} className="hidden" />
          <label htmlFor="imgfile" className="px-3 py-2 bg-slate-100 rounded-full cursor-pointer">📎</label>
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-full">Send</button>
        </form>
        {file && (
          <form onSubmit={sendImage} className="mt-2 flex items-center gap-2">
            <div className="text-sm text-slate-600">Ready to upload: {file.name}</div>
            <button type="submit" className="ml-auto px-3 py-1 rounded-md border">Upload</button>
          </form>
        )}
      </div>
    </div>
  );
}
