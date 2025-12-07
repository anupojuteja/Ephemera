import React from "react";

/* Header: left brand + right profile */
export default function Header({ me, onLogout }) {
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-40 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm py-3">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-badge flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7H6L8 5H16L18 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V9C2 7.9 2.9 7 4 7Z" fill="white"/>
              <circle cx="12" cy="13" r="3.2" fill="#fff"/>
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="text-xl font-bold">Ephemera</div>
            <div className="text-sm muted">Private Chat</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {me ? (
            <>
              <div className="flex items-center gap-3">
                <div className="avatar-ring p-[2px] rounded-full">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(me.username)}&background=8134AF&color=fff&size=64`} alt="avatar" className="w-10 h-10 rounded-full" />
                </div>
                <div className="text-sm muted hidden sm:block">{me.username}</div>
              </div>

              <button onClick={onLogout} className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.04)]">
                Logout
              </button>
            </>
          ) : (
            <div className="text-sm muted">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
}
