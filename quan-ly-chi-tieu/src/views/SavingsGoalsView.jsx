import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { GoalItem } from "../components/GoalItem";
import { CompletedGoalsDialog } from "../components/CompletedGoalsDialog";
import { ContributeToGoalDialog } from "../components/ContributeToGoalDialog";
import { EditGoalDialog } from "../components/EditGoalDialog";
import { GoalHistoryDialog } from "../components/GoalHistoryDialog";
import "../styles/SavingsGoalsView.css";

export const SavingsGoalsView = () => {
  const { goals, isLoadingData, handleDeleteGoal, formatCurrency } = useAppContext();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [dialogState, setDialogState] = useState({
    contribute: false,
    edit: false,
    history: false,
  });

  const hasCompletedGoals = useMemo(
    () =>
      goals.some(
        (g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0
      ),
    [goals]
  );

  const activeGoals = useMemo(
    () => goals.filter((g) => g.currentAmount < g.targetAmount || g.targetAmount === 0),
    [goals]
  );

  const completedGoalsCount = useMemo(
    () => goals.filter((g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0).length,
    [goals]
  );

  const totalSaved = useMemo(
    () => goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
    [goals]
  );

  const totalTarget = useMemo(
    () => goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0),
    [goals]
  );

  return (
    <>
      <AddGoalDialog
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
      />
      <CompletedGoalsDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
      <ContributeToGoalDialog
        isOpen={dialogState.contribute}
        onClose={() => setDialogState({ ...dialogState, contribute: false })}
        goal={selectedGoal}
      />
      <EditGoalDialog
        isOpen={dialogState.edit}
        onClose={() => setDialogState({ ...dialogState, edit: false })}
        goal={selectedGoal}
      />
      <GoalHistoryDialog
        isOpen={dialogState.history}
        onClose={() => setDialogState({ ...dialogState, history: false })}
        goal={selectedGoal}
      />

      <div className="page-container">
        {/* Header Banner */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="page-title">
                Mục tiêu Tiết kiệm
              </h2>
              <p className="page-subtitle">
                Theo dõi và quản lý các mục tiêu tài chính cá nhân
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasCompletedGoals && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Đã hoàn thành
                </button>
              )}
              <button
                onClick={() => setIsAddGoalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm mục tiêu
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="kpi-grid-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-indigo-100 dark:bg-indigo-900/30">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="kpi-label">Đang thực hiện</span>
              <span className="kpi-value block text-indigo-600 dark:text-indigo-400">
                {activeGoals.length} mục tiêu
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon bg-emerald-100 dark:bg-emerald-900/30">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="kpi-label">Đã tiết kiệm</span>
              <span className="kpi-value block text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalSaved)}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon bg-amber-100 dark:bg-amber-900/30">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="kpi-label">Tổng mục tiêu</span>
              <span className="kpi-value block text-amber-600 dark:text-amber-400">
                {formatCurrency(totalTarget)}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingData && <p className="goals-loading">Đang tải mục tiêu...</p>}

        {/* Empty State */}
        {!isLoadingData && goals.length === 0 && (
          <div className="goals-empty-state">
            <svg className="goals-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="goals-empty-title">Bạn chưa có mục tiêu nào</h3>
            <p className="goals-empty-desc">
              Hãy bắt đầu đặt mục tiêu để hiện thực hóa ước mơ tài chính!
            </p>
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo mục tiêu đầu tiên
            </button>
          </div>
        )}

        {/* Goals Grid */}
        {!isLoadingData && goals.length > 0 && (
          <div className="goals-grid">
            {goals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onContribute={() => {
                  setSelectedGoal(goal);
                  setDialogState({ ...dialogState, contribute: true });
                }}
                onEdit={() => {
                  setSelectedGoal(goal);
                  setDialogState({ ...dialogState, edit: true });
                }}
                onHistory={() => {
                  setSelectedGoal(goal);
                  setDialogState({ ...dialogState, history: true });
                }}
                onDelete={() => handleDeleteGoal(goal.id, goal.name)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
