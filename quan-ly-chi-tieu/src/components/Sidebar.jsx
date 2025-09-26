import React from "react";
import { handleGoogleSignIn } from "../config/firebase";
import { useAppContext } from "../context/AppContext";

export const Sidebar = ({ isListening, toggleListening }) => {
  const {
    activeView,
    setActiveView,
    user,
    theme,
    toggleTheme,
    handleSignOut,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
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
      id: "history",
      label: "Lịch sử",
      icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    },
    {
      id: "add",
      label: "Thêm Mới",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
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
    <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 flex-shrink-0 p-4 lg:p-6 flex flex-col items-center lg:items-stretch shadow-2xl dark:shadow-none transition-all duration-300">
      <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 lg:mb-4 hidden lg:block">
        Trợ lý Chi tiêu
      </h1>

      {user && (
        <>
          {/* Desktop User/Login Info */}
          <div className="hidden lg:block mb-10">
            {user.isAnonymous ? (
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Đăng nhập Google
              </button>
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-indigo-300"
                />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {user.displayName}
                </p>
              </div>
            )}
          </div>

          {/* Mobile User/Login Info */}
          <div className="lg:hidden mb-10">
            {user.isAnonymous ? (
              <button
                onClick={handleGoogleSignIn}
                className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                aria-label="Đăng nhập Google"
              >
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </button>
            ) : (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-indigo-300"
              />
            )}
          </div>
        </>
      )}

      <nav className="flex flex-col space-y-3 w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center justify-center lg:justify-start text-lg font-semibold p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              activeView === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/50"
                : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 lg:mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d={item.icon} />
            </svg>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
        {/* Nút micro */}
        <button
          onClick={toggleListening}
          className={`flex items-center justify-center lg:justify-start text-lg font-semibold p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
            isListening
              ? "bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-500/50 animate-pulse"
              : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
          }`}
          aria-label={isListening ? "Dừng ghi âm" : "Ghi âm giao dịch"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 lg:mr-3"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d={isListening ? micOffIcon : micOnIcon} />
          </svg>
          <span className="hidden lg:inline">
            {isListening ? "Đang ghi..." : "Ghi âm"}
          </span>
        </button>
      </nav>
      <div className="mt-auto w-full">
        {!user?.isAnonymous && (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center lg:justify-start text-lg font-semibold p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 lg:mr-3"
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
