import React from "react";
import { handleGoogleSignIn } from "../config/firebase";
import { useAppContext } from "../context/AppContext";

export const Sidebar = () => {
  const {
    activeView,
    setActiveView,
    user,
    profile,
    theme,
    toggleTheme,
    handleSignOut,
  } = useAppContext();

  const navItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    },
    {
      id: "statistics",
      label: "Báo cáo",
      icon: "M16 8.5l-4.5 4.5-2.5-2.5-4.5 4.5V7H16v1.5z",
    },
    {
      id: "budget",
      label: "Ngân sách",
      icon: "M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3L21.5 11.5z",
    },
    {
      id: "goals",
      label: "Mục tiêu",
      icon: "M15 10V8h2V6h-2V4h-2v2h-2v2h2v2h2zm-2-9C7.34 1 2 6.34 2 12s5.34 11 11 11 11-5.34 11-11S18.66 1 13 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9z",
    },
    {
      id: "history",
      label: "Lịch sử",
      icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    },
    {
      id: "add",
      label: "Thêm Mới",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
    },
    {
      id: "calculator",
      label: "Tính Lương & Thuế",
      icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z",
    },
    {
      id: "feed",
      label: "Nhật ký Ảnh",
      icon: "M4 4h3l2-2h6l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm8 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z",
    },
    {
      id: "profile",
      label: "Trang cá nhân",
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: "M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-1.92 3.32c-.12.2-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l1.92-3.32c.12-.2.07-.47-.12-.61l-2.01-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
    },
  ];

  const micOnIcon =
    "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z";
  const micOffIcon =
    "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2s-1.2-.54-1.2-1.2V4.9zm6.3 6.2c0 .55.45 1 1 1s1-.45 1-1h-2zm-1.1 4.3c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2.1c-.55 2.22-2.48 4-4.9 4zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z";

  return (
    <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-stone-50 dark:bg-stone-900 border-r border-stone-200/60 dark:border-stone-800 flex-shrink-0 p-5 flex-col items-stretch shadow-md dark:shadow-none transition-all duration-300 overflow-y-auto z-20">
      <div className="flex items-center gap-3 mb-5 shrink-0 cursor-pointer" onClick={() => setActiveView("dashboard")}>
        <img
          src="/app-logo-3d.png"
          alt="LifeHub Logo"
          className="w-10 h-10 rounded-xl shadow-md object-contain hover:scale-105 transition-transform"
        />
        <div className="hidden lg:block">
          <h1 className="text-xl font-serif font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight leading-none">
            LifeHub
          </h1>
          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 tracking-wider uppercase block mt-0.5">
            Sống & Tài Chính
          </span>
        </div>
      </div>

      {user && (
        <div className="shrink-0 mb-4">
          {/* Desktop User Info Card */}
          <div className="hidden lg:block">
            <button
              onClick={() => setActiveView("landing")}
              className={`w-full group p-2.5 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                activeView === "landing"
                  ? "bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 shadow-sm"
                  : "bg-stone-100/60 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800"
              }`}
              title="Xem Trang giới thiệu (Landing Page)"
            >
              <div className="relative">
                <img
                  src={profile?.avatarUrl || user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                  alt="Avatar"
                  className="w-11 h-11 rounded-full border-2 border-emerald-700 group-hover:scale-105 transition-transform duration-200 shadow-sm object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-800 text-white p-1 rounded-full text-[9px] shadow-sm flex items-center justify-center">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                  {profile?.fullName || user.displayName || "Nguyễn Huỳnh Phúc Khang"}
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                  Trang Giới Thiệu ↗
                </p>
              </div>
            </button>
          </div>

          {/* Mobile User Profile Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setActiveView("landing")}
              className="relative group p-0.5 rounded-full border-2 border-emerald-700 hover:scale-105 transition-transform cursor-pointer"
              title="Trang giới thiệu"
            >
              <img
                src={profile?.avatarUrl || user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
            </button>
          </div>
        </div>
      )}

      <nav className="flex flex-col space-y-1.5 w-full flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center justify-center lg:justify-start text-sm font-semibold py-2.5 px-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] tracking-wide ${
              activeView === item.id
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/20 dark:bg-emerald-700"
                : "text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 lg:mr-3 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d={item.icon} />
            </svg>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-stone-200/60 dark:border-stone-800 w-full shrink-0">
        {!user?.isAnonymous && (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center lg:justify-start text-sm font-semibold py-2.5 px-3.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 transition-colors tracking-wide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 lg:mr-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden lg:inline">Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};
