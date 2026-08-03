import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { handleGoogleSignIn } from "../config/firebase";
import "../styles/ProfileView.css";

export const ProfileView = () => {
  const [isVirtualMenuOpen, setIsVirtualMenuOpen] = useState(false);
  const {
    user,
    income,
    expense,
    total,
    goals,
    transactions,
    formatCurrency,
    handleSignOut,
    setActiveView,
    isPinLockEnabled,
    isPushSubscribed,
  } = useAppContext();

  const isGuest = !user || user.isAnonymous;

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="page-title">Trang cá nhân</h2>
            <p className="page-subtitle">
              Thông tin tài khoản & tổng quan tài chính cá nhân
            </p>
          </div>

          <button
            onClick={() => setActiveView("settings")}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Cài đặt hệ thống</span>
          </button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.photoURL || "https://via.placeholder.com/100"}
              alt="Avatar"
              className="profile-avatar-img"
            />
            {!isGuest && (
              <span className="profile-badge-icon" title="Đã xác thực Google">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isGuest ? "Khách Vô Danh" : user?.displayName}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isGuest ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
              }`}>
                {isGuest ? "Tài khoản tạm" : "Thành viên Google"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 truncate">
              {isGuest ? "Chưa liên kết Google Account" : user?.email}
            </p>

            <div className="mt-4 flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              {isGuest ? (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Đăng nhập đồng bộ dữ liệu
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/30 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất tài khoản
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Số dư hiện tại</span>
            <span className="kpi-value block text-slate-800 dark:text-slate-100">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Tổng thu nhập</span>
            <span className="kpi-value block text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-rose-100 dark:bg-rose-900/30">
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Tổng chi tiêu</span>
            <span className="kpi-value block text-rose-600 dark:text-rose-400">
              {formatCurrency(Math.abs(expense))}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-amber-100 dark:bg-amber-900/30">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Mục tiêu tiết kiệm</span>
            <span className="kpi-value block text-amber-600 dark:text-amber-400">
              {goals?.length || 0} mục tiêu
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Navigation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="page-card p-5">
            <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
              Lối tắt quản lý
            </h3>

            <div className="space-y-3">
              <div
                onClick={() => setActiveView("history")}
                className="profile-quick-link"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Lịch sử Giao dịch
                    </span>
                    <span className="text-xs text-slate-400">
                      Tổng số: {transactions?.length || 0} giao dịch đã ghi nhận
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Xem →</span>
              </div>

              <div
                onClick={() => setActiveView("budget")}
                className="profile-quick-link"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Quản lý Ngân sách
                    </span>
                    <span className="text-xs text-slate-400">
                      Kiểm soát hạn mức chi tiêu từng danh mục
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Xem →</span>
              </div>

              <div
                onClick={() => setActiveView("statistics")}
                className="profile-quick-link"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Báo cáo & Thống kê
                    </span>
                    <span className="text-xs text-slate-400">
                      Biểu đồ xu hướng và phân tích tỷ trọng chi
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Xem →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Status & Security (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="page-card p-5">
            <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
              Bảo mật & Cấu hình
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Khóa PIN ứng dụng:</span>
                <span className={`font-bold ${isPinLockEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {isPinLockEnabled ? "🔒 Đã bật" : "🔓 Chưa bật"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Thông báo đẩy:</span>
                <span className={`font-bold ${isPushSubscribed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {isPushSubscribed ? "🔔 Đã đăng ký" : "🔕 Chưa bật"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Trạng thái đồng bộ:</span>
                <span className={`font-bold ${!isGuest ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                  {!isGuest ? "☁️ Đã đồng bộ Cloud" : "💾 Cục bộ (Local)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nút Menu Ảo (AssistiveTouch Floating Virtual Menu) */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-8 z-50">
        <AnimatePresence>
          {isVirtualMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2 w-56 origin-bottom-right"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>Menu Mở Rộng</span>
                <button
                  onClick={() => setIsVirtualMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveView("history");
                  setIsVirtualMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-all"
              >
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Lịch sử Giao dịch
              </button>

              <button
                onClick={() => {
                  setActiveView("goals");
                  setIsVirtualMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition-all"
              >
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Mục tiêu Tiết kiệm
              </button>

              <button
                onClick={() => {
                  setActiveView("statistics");
                  setIsVirtualMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-xl transition-all"
              >
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                Báo cáo & Thống kê
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsVirtualMenuOpen((prev) => !prev)}
          className="w-13 h-13 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center border-2 border-white/30 active:scale-95 hover:scale-105 transition-all cursor-pointer"
          title="Menu ảo mở rộng (Lịch sử, Mục tiêu, Báo cáo)"
        >
          {isVirtualMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
