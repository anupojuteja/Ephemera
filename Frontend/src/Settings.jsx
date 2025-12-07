import React, { useState, useRef } from "react";
import api from "./api";
import Avatar from "./Avatar";

export default function Settings({ me, onUpdateUser }) {
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState("");
    const fileInputRef = useRef(null);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMsg("File too large (max 5MB)");
            return;
        }

        setUploading(true);
        setMsg("");

        try {
            // Direct upload
            const formData = new FormData();
            formData.append("avatar", file);

            // We need a specific API call for avatar update
            // Assuming api.js will be updated to include updateAvatar
            const updatedUser = await api.updateAvatar(file);
            onUpdateUser(updatedUser);
            setMsg("Avatar updated successfully!");
        } catch (err) {
            console.error(err);
            setMsg("Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto pt-10 px-4">
            <h1 className="text-3xl font-bold mb-6 text-white">Profile Settings</h1>

            <div className="card p-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-slate-200">Public Profile</h2>

                <div className="flex items-start gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar user={me} size="xl" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
                        >
                            {uploading ? "Uploading..." : "Change Avatar"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                            <div className="text-lg text-white font-medium">{me.username}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <div className="text-white">{me.email || "No email set"}</div>
                        </div>

                        {msg && (
                            <div className={`text-sm p-3 rounded-lg border ${msg.includes("failed") ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"}`}>
                                {msg}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
