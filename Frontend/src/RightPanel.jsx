import React from "react";

/* Simple right-side info panel */
export default function RightPanel({ me, otherUser }) {
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700">{me.username.slice(0,1).toUpperCase()}</div>
        <div>
          <div className="font-semibold">Profile</div>
          <div className="text-sm text-slate-500">Personal info</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold mb-1">About</div>
        <div className="text-sm text-slate-600">This is your Ephemera chat. Add avatars, status, and more.</div>
      </div>

      <div className="mb-4">
        <div className="font-semibold mb-2">Shared files</div>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded-md border text-sm">report.pdf <span className="text-xs text-slate-500">1.2MB</span></div>
          <div className="p-2 bg-white rounded-md border text-sm">image.png <span className="text-xs text-slate-500">420KB</span></div>
        </div>
      </div>

      <div className="mt-auto text-sm text-slate-500">
        Tip: add avatars and reactions to make chat more social.
      </div>
    </div>
  );
}
