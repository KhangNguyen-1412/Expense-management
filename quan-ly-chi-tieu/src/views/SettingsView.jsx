import React from "react";
import { useAppContext } from "../context/AppContext";

const SettingRow = ({ title, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
    <div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
    <div>{children}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
      checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
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
    <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
        Cài đặt
      </h3>
      <div className="space-y-2">
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
            className="w-48 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Mặc định</option>
            {availableVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </SettingRow>
        <div className="pt-6">
          <button
            onClick={openDeleteDataDialog}
            className="w-full text-left px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold transition-colors"
          >
            Xóa toàn bộ dữ liệu
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
            Hành động này không thể hoàn tác. Tất cả giao dịch và ngân sách của
            bạn sẽ bị xóa vĩnh viễn.
          </p>
        </div>
      </div>
    </div>
  );
};
