import React from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/SettingsView.css";

const SettingRow = ({ title, description, children }) => (
  <div className="setting-row">
    <div>
      <h4 className="setting-info-title">{title}</h4>
      <p className="setting-info-description">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
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
    <div className="settings-container">
      <h3 className="settings-title">Cài đặt</h3>
      <div className="settings-list">
        <SettingRow
          title="Giao diện tối"
          description="Bật/tắt giao diện nền tối để giảm mỏi mắt."
        >
          <ToggleSwitch checked={theme === "dark"} onChange={toggleTheme} />
        </SettingRow>
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
        <div className="delete-data-section">
          <button onClick={openDeleteDataDialog} className="delete-data-button">
            Xóa toàn bộ dữ liệu
          </button>
          <p className="delete-data-note">
            Hành động này không thể hoàn tác. Tất cả giao dịch và ngân sách của
            bạn sẽ bị xóa vĩnh viễn.
          </p>
        </div>
      </div>
    </div>
  );
};
