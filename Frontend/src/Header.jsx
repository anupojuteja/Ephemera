import React from "react";

/* Simple top header mimicking WhatsApp's top bar */
export default function Header({ me, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">E</div>
          <div>
            <div className="font-semibold">Ephemera</div>
            <div className="text-xs text-slate-500">Private Chat</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {me ? (
            <>
              <div className="text-sm text-slate-700 hidden sm:block">{me.username}</div>
              <button onClick={onLogout} className="text-sm text-emerald-600 border border-emerald-100 px-3 py-1 rounded-md">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
