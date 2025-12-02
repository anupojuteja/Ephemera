import React from "react";

/* Top header with title logo */
export default function Header({ me, onLogout }) {
  return (
    <header className="w-full bg-[rgba(0,0,0,0.25)] backdrop-blur-sm py-4 px-6 flex items-center justify-between border-b border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-4">
        <div className="logo-badge">
          {/* simple camera icon SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs />
            <path d="M4 7H6L8 5H16L18 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V9C2 7.9 2.9 7 4 7Z" fill="white" fillOpacity="0.95"/>
            <circle cx="12" cy="13" r="3.2" fill="#fff" fillOpacity="0.9"/>
          </svg>
        </div>

        <div className="app-logo text-white">
          <div style={{fontSize:20}}>Ephemera</div>
          <div className="text-sm muted">Private Chat</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {me ? (
          <>
            <div className="flex items-center gap-2">
              <div className="avatar-ring">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(me.username)}&background=8134AF&color=fff`} alt="avatar" className="w-8 h-8 rounded-full" />
              </div>
              <div className="small muted">{me.username}</div>
            </div>
            <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token"); onLogout(); }} className="px-3 py-1 rounded-xl border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)]">
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
