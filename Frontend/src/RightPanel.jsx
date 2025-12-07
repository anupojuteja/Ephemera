import React from "react";

/*
 RightPanel: shows details about the active chat / shared media.
 For now we show placeholders that match the design in your image.
*/

export default function RightPanel({ me, otherUser, room }) {
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
          <div className="text-lg font-bold">EP</div>
        </div>
        <div>
          <div className="font-semibold">Ephemera</div>
          <div className="muted small">Private Chat • {room ? "Room active" : "No room selected"}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Members</div>
          <div className="text-sm muted">See all</div>
        </div>

        <div className="flex items-center gap-2">
          <img src="https://ui-avatars.com/api/?name=Alice&background=F58529&color=fff" className="w-10 h-10 rounded-full" alt="" />
          <img src="https://ui-avatars.com/api/?name=Bob&background=DD2A7B&color=fff" className="w-10 h-10 rounded-full" alt="" />
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-sm muted">+27</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold mb-2">Photos & videos</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 rounded-lg bg-[rgba(255,255,255,0.03)]" />
          <div className="h-20 rounded-lg bg-[rgba(255,255,255,0.03)]" />
          <div className="h-20 rounded-lg bg-[rgba(255,255,255,0.03)]" />
          <div className="h-20 rounded-lg bg-[rgba(255,255,255,0.03)]" />
        </div>
      </div>

      <div className="mt-auto">
        <div className="font-semibold mb-2">Shared files</div>
        <div className="space-y-2">
          <div className="p-2 bg-[rgba(255,255,255,0.02)] rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm">report.pdf</div>
              <div className="muted text-xs">1.2 MB</div>
            </div>
            <div className="text-sm muted">Open</div>
          </div>

          <div className="p-2 bg-[rgba(255,255,255,0.02)] rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm">notes.txt</div>
              <div className="muted text-xs">4 KB</div>
            </div>
            <div className="text-sm muted">Open</div>
          </div>
        </div>
      </div>
    </div>
  );
}
