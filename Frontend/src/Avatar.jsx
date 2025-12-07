import React, { useMemo } from "react";

/* 
  Professional Gradient Palettes (Backgrounds)
  Deterministic based on username
*/
const GRADIENTS = [
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-cyan-500",
    "bg-gradient-to-br from-emerald-500 to-teal-500",
    "bg-gradient-to-br from-rose-500 to-pink-600",
    "bg-gradient-to-br from-amber-500 to-orange-600",
    "bg-gradient-to-br from-slate-500 to-slate-700",
];

export default function Avatar({ user, size = "md", className = "" }) {
    // Sizes: sm=32px, md=40px, lg=64px, xl=128px
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-32 h-32 text-4xl",
    };

    const username = user?.username || "?";

    // Deterministic gradient selection
    const gradientClass = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % GRADIENTS.length;
        return GRADIENTS[index];
    }, [username]);

    const initials = username.substring(0, 2).toUpperCase();
    const avatarUrl = user?.avatar;

    return (
        <div
            className={`
        relative rounded-full flex items-center justify-center shrink-0 font-bold text-white shadow-inner
        ${sizeClasses[size] || sizeClasses.md}
        ${!avatarUrl ? gradientClass : "bg-slate-800"}
        ${className}
      `}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover rounded-full"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
