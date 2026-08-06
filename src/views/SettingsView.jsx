import React from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/SettingsView.css";

const SettingRow = ({ title, description, children }) => (
  <div className="setting-row">
    <div className="min-w-0 flex-1 mr-4">
      <h4 className="setting-info-title">{title}</h4>
      <p className="setting-info-description">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={disabled ? undefined : onChange}
    className={`toggle-switch ${
      disabled
        ? "opacity-40 cursor-not-allowed bg-slate-300 dark:bg-slate-700"
        : checked
        ? "toggle-switch-on"
        : "toggle-switch-off"
    }`}
  >
    <span
      className={`toggle-knob ${
        checked && !disabled ? "toggle-knob-on" : "toggle-knob-off"
      }`}
    />
  </button>
);

export const SettingsView = () => {
  const {
    theme,
    themeStyle,
    setThemeStyle,
    isDarkMode,
    isAutoTime,
    toggleDarkMode,
    toggleAutoTime,
    driveFolderUrl,
    setDriveFolderUrl,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    user,
    isPinLockEnabled,
    disablePinLock,
    openSetPinDialog,
    openDeleteDataDialog,
    isVoiceFeedbackEnabled,
    toggleVoiceFeedback,
    availableVoices,
    selectedVoiceURI,
    handleSelectVoice,
  } = useAppContext();

  const themeOptions = [
    { id: "fintech_indigo", label: "💎 Fintech Indigo", desc: "Xanh Indigo & Sapphire hiện đại" },
    { id: "luxury_gold", label: "👑 Luxury Gold", desc: "Đen nhám & Vàng Hoàng Gia" },
    { id: "sunset", label: "🌅 Sunset", desc: "Tông Hoàng Hôn ấm áp" },
    { id: "sunrise", label: "🌄 Sunrise", desc: "Tông Bình Minh sáng dịu" },
  ];

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <h2 className="page-title">
          Cài đặt
        </h2>
        <p className="page-subtitle">
          Tùy chỉnh giao diện, thông báo, bảo mật và trợ lý giọng nói
        </p>
      </div>

      {/* Section 1: Appearance & Time-Based Themes */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Giao diện & Tông Màu Chủ Đạo</h3>
            <p className="section-desc">Tùy chọn bộ màu ứng dụng, chế độ tối và tự động theo thời gian</p>
          </div>
        </div>

        {/* Theme Preset Selection Row */}
        <div className="p-6">
          <h4 className="setting-info-title mb-1">Bộ màu giao diện chủ đạo</h4>
          <p className="setting-info-description mb-3">Chọn phong cách màu hiển thị ưu thích cho ứng dụng</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setThemeStyle(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  themeStyle === opt.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="text-xs font-bold truncate">{opt.label}</div>
                <div className={`text-[10px] mt-0.5 truncate ${themeStyle === opt.id ? "text-indigo-100" : "text-slate-400 dark:text-slate-400"}`}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-700/60" />

        <SettingRow
          title="Giao diện tối cố định"
          description="Bật chế độ nền tối cố định để giảm mỏi mắt khi sử dụng ban đêm."
        >
          <ToggleSwitch checked={isDarkMode} onChange={toggleDarkMode} />
        </SettingRow>

        <div className="border-t border-slate-200/60 dark:border-slate-700/60" />

        <SettingRow
          title="Tự động đổi giao diện theo thời gian"
          description="Tự động chuyển màu giao diện theo thời gian thực (Bình minh: 05:00 - 08:00, Ban ngày: 08:00 - 17:00, Hoàng hôn: 17:00 - 19:00, Ban đêm: 19:00 - 05:00)."
        >
          <ToggleSwitch
            checked={isAutoTime && !isDarkMode}
            onChange={toggleAutoTime}
            disabled={isDarkMode}
          />
        </SettingRow>

        {isDarkMode && (
          <div className="mx-5 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Chức năng <b>Tự động đổi giao diện theo thời gian</b> đã bị vô hiệu hóa do bạn đang bật cố định <b>Giao diện tối</b>.</span>
          </div>
        )}
      </div>

      {/* Section: PWA App Shortcuts & Install Guide */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-blue-100 dark:bg-blue-900/30">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Ứng dụng PWA & Phím Tắt Màn Hình Chính</h3>
            <p className="section-desc">Cài đặt ứng dụng lên màn hình chính để mở nhanh bằng phím tắt</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <span>➕</span> <span>Thêm Chi Tiêu</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Mở thẳng màn hình ghi chép giao dịch ngay khi giữ icon ứng dụng.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <span>📊</span> <span>Tổng Quan Số Dư</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Truy cập tức thì biểu đồ báo cáo và hạn mức ngân sách.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <span>📸</span> <span>Nhật Ký Ảnh</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Lưu nhanh hình ảnh khoảnh khắc lên kho Google Drive.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">💡</span>
            <div className="space-y-1">
              <p className="font-bold">Cách dùng phím tắt màn hình chính (App Shortcuts):</p>
              <p className="text-[11px] leading-relaxed">
                Trên Điện thoại (iOS Safari / Android Chrome): Nhấn chọn <b>Chia sẻ</b> hoặc Menu 3 chấm -&gt; Chọn <b>"Thêm vào Màn hình chính" (Add to Home Screen)</b>.
                Sau khi cài đặt, <b>nhấn giữ biểu tượng ứng dụng LifeHub</b> trên màn hình chính để chọn mở nhanh tính năng mong muốn!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Google Drive Photo Storage */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M3 15a4 4 0 014-4h10a4 4 0 014 4M3 15V9a4 4 0 014-4h10a4 4 0 014 4v6m-9-6v6m0-6l-3 3m3-3l3 3" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Kho ảnh Google Drive (Dòng thời gian / Nhật ký)</h3>
            <p className="section-desc">Liên kết Folder Google Drive cá nhân để lưu trữ hình ảnh bài đăng</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Đường dẫn Folder Google Drive (Quyền xem: Bất kỳ ai có liên kết):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/1A2B3C..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {driveFolderUrl && (
              <a
                href={driveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Mở Folder</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-1.5">
            <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><b>Hướng dẫn</b>: Tạo 1 Folder tên <i>"Nhật ký ảnh cá nhân"</i> trên Google Drive của bạn -&gt; Chuột phải chọn <b>Chia sẻ</b> -&gt; Đổi quyền thành <b>"Bất kỳ ai có liên kết đều có thể xem"</b> -&gt; Dán đường dẫn Folder đó vào đây.</span>
          </p>
        </div>
      </div>

      {/* Section 2: Notifications & Security */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-amber-100 dark:bg-amber-900/30">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Thông báo & Bảo mật</h3>
            <p className="section-desc">Quản lý thông báo đẩy và khóa ứng dụng</p>
          </div>
        </div>

        {isPushSupported && !user?.isAnonymous && (
          <SettingRow
            title="Thông báo đẩy"
            description="Nhận thông báo khi sắp hết hoặc vượt ngân sách."
          >
            <ToggleSwitch
              checked={isPushSubscribed}
              onChange={
                isPushSubscribed ? unsubscribeFromPush : subscribeToPush
              }
            />
          </SettingRow>
        )}

        <SettingRow
          title="Khóa bằng mã PIN"
          description="Yêu cầu nhập mã PIN mỗi khi mở ứng dụng."
        >
          <ToggleSwitch
            checked={isPinLockEnabled}
            onChange={() => {
              if (isPinLockEnabled) {
                disablePinLock();
              } else {
                openSetPinDialog();
              }
            }}
          />
        </SettingRow>
      </div>

      {/* Section 3: Voice Assistant */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-violet-100 dark:bg-violet-900/30">
            <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Trợ lý Giọng nói</h3>
            <p className="section-desc">Cấu hình phản hồi bằng giọng nói</p>
          </div>
        </div>

        <SettingRow
          title="Phản hồi bằng giọng nói"
          description="Bật/tắt giọng nói của trợ lý khi nhận dạng."
        >
          <ToggleSwitch
            checked={isVoiceFeedbackEnabled}
            onChange={toggleVoiceFeedback}
          />
        </SettingRow>

        <SettingRow
          title="Giọng nói của trợ lý"
          description={
            availableVoices.length > 0
              ? "Chọn giọng nam hoặc nữ (nếu có)."
              : "Trình duyệt của bạn không hỗ trợ giọng nói tiếng Việt."
          }
        >
          <select
            value={selectedVoiceURI || ""}
            onChange={(e) => handleSelectVoice(e.target.value)}
            disabled={availableVoices.length === 0}
            className="settings-select"
          >
            <option value="">Mặc định</option>
            {availableVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </SettingRow>
      </div>

      {/* Section 4: Danger Zone */}
      <div className="danger-section">
        <div className="danger-section-header">
          <div className="settings-section-icon bg-rose-200/60 dark:bg-rose-900/40">
            <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="settings-section-title text-rose-700 dark:text-rose-400">Vùng nguy hiểm</h3>
            <p className="settings-section-desc text-rose-400/80 dark:text-rose-500/60">Hành động không thể hoàn tác</p>
          </div>
        </div>

        <div className="p-5">
          <button onClick={openDeleteDataDialog} className="danger-btn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa toàn bộ dữ liệu
          </button>
          <p className="danger-note">
            ⚠️ Hành động này không thể hoàn tác. Tất cả giao dịch, ngân sách và mục tiêu của bạn sẽ bị xóa vĩnh viễn.
          </p>
        </div>
      </div>
    </div>
  );
};
