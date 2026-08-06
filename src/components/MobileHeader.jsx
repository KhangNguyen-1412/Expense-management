import React from "react";
import { useAppContext } from "../context/AppContext";

export const MobileHeader = () => {
  const { setActiveView, profile, user } = useAppContext();

  const avatarUrl =
    profile?.avatarUrl ||
    user?.photoURL ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Name */}
      <div
        className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        onClick={() => setActiveView("dashboard")}
      >
        <img
          src="/app-logo-3d.png"
          alt="LifeHub Logo"
          className="w-8 h-8 rounded-lg shadow-sm object-contain"
        />
        <div>
          <h1 className="text-base font-sans font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight leading-none">
            LifeHub
          </h1>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mt-0.5">
            Sống & Tài Chính
          </span>
        </div>
      </div>

      {/* Action Buttons: Landing Page & Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView("landing")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all active:scale-95 shadow-sm"
          title="Xem Trang Giới Thiệu (Landing Page)"
        >
          <span>Trang Giới Thiệu</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>

        {user && (
          <button
            onClick={() => setActiveView("profile")}
            className="p-0.5 rounded-full border-2 border-indigo-600 active:scale-95 transition-transform"
            title="Trang cá nhân"
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          </button>
        )}
      </div>
    </header>
  );
};
