import React from "react";
import { useAppContext } from "../context/AppContext";

const PROGRESS_COLORS = [
  { threshold: 100, bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { threshold: 75, bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  { threshold: 50, bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { threshold: 25, bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  { threshold: 0, bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
];

const getProgressStyle = (pct) => {
  for (const c of PROGRESS_COLORS) {
    if (pct >= c.threshold) return c;
  }
  return PROGRESS_COLORS[PROGRESS_COLORS.length - 1];
};

export const GoalItem = ({
  goal,
  onContribute,
  onEdit,
  onHistory,
  onDelete,
}) => {
  const { formatCurrency } = useAppContext();

  const progress =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const style = getProgressStyle(progress);

  return (
    <div className="goal-card" onClick={onHistory}>
      {/* Header */}
      <div className="goal-card-header cursor-pointer">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="goal-name">{goal.name}</h4>
            {isCompleted && (
              <span className="goal-completed-badge">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Hoàn thành
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
        </div>

        {/* Progress percentage circle */}
        <div className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
          isCompleted
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30"
        }`}>
          <span className={`text-xs font-extrabold ${style.text}`}>
            {Math.min(progress, 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="goal-progress-section">
        <div className="goal-progress-bar-bg">
          <div
            className={`goal-progress-bar-fg ${style.bg}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="goal-progress-info">
          <span className="goal-progress-text">
            {isCompleted
              ? "🎉 Đã đạt mục tiêu!"
              : `Còn thiếu: ${formatCurrency(Math.max(0, remaining))}`
            }
          </span>
          <span className={`goal-progress-pct ${style.text}`}>
            {progress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="goal-actions" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onContribute}
          disabled={isCompleted}
          className="goal-action-btn goal-contribute-btn"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Gửi tiền
        </button>
        <button onClick={onEdit} className="goal-action-btn goal-edit-btn">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
          </svg>
          Sửa
        </button>
        <button onClick={onHistory} className="goal-action-btn goal-edit-btn">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lịch sử
        </button>
        <button onClick={onDelete} className="goal-action-btn goal-delete-btn ml-auto">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Xóa
        </button>
      </div>
    </div>
  );
};
