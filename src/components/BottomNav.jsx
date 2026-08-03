import React from "react";
import { useAppContext } from "../context/AppContext";

export const BottomNav = () => {
  const { activeView, setActiveView } = useAppContext();

  const navItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "calculator",
      label: "Lương & Thuế",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "add",
      label: "Thêm mới",
      isCenter: true,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: "budget",
      label: "Ngân sách",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Cá nhân",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav aria-label="Điều hướng di động" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const isActive = activeView === item.id;

        if (item.isCenter) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="relative -mt-7 group flex flex-col items-center cursor-pointer"
              aria-label="Thêm mới giao dịch"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-slate-100 dark:border-slate-950 active:scale-95 group-hover:scale-105 transition-all">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? "bg-indigo-50 dark:bg-indigo-950/60" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
