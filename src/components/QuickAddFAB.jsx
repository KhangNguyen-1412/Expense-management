import React from "react";
import { useAppContext } from "../context/AppContext";

export const QuickAddFAB = () => {
  const { activeView, setActiveView } = useAppContext();

  // Don't show on "add" view itself or landing page
  if (activeView === "add" || activeView === "landing") return null;

  return (
    <div className="hidden lg:block fixed bottom-8 right-8 z-40">
      <button
        onClick={() => setActiveView("add")}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl shadow-indigo-500/30 border border-indigo-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Thêm Giao Dịch Mới (Phím Tắt Nhanh)"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span className="text-sm tracking-wide font-sans">Thêm Chi Tiêu</span>
      </button>
    </div>
  );
};
