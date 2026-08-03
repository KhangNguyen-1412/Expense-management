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

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`toggle-switch ${
      checked ? "toggle-switch-on" : "toggle-switch-off"
    }`}
  >
    <span
      className={`toggle-knob ${
        checked ? "toggle-knob-on" : "toggle-knob-off"
      }`}
    />
  </button>
);

export const SettingsView = () => {
  const {
    theme,
    toggleTheme,
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

      {/* Section 1: Appearance */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="section-title">Giao diện & Hiển thị</h3>
            <p className="section-desc">Tùy chỉnh chế độ sáng tối</p>
          </div>
        </div>

        <SettingRow
          title="Giao diện tối"
          description="Bật chế độ nền tối để giảm mỏi mắt khi sử dụng ban đêm."
        >
          <ToggleSwitch checked={theme === "dark"} onChange={toggleTheme} />
        </SettingRow>
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
