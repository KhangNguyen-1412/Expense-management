import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { GoalItem } from "../components/GoalItem";
import { CompletedGoalsDialog } from "../components/CompletedGoalsDialog";
import { ContributeToGoalDialog } from "../components/ContributeToGoalDialog";
import { EditGoalDialog } from "../components/EditGoalDialog";
import { GoalHistoryDialog } from "../components/GoalHistoryDialog";

export const SavingsGoalsView = () => {
  const { goals, isLoadingData, handleDeleteGoal } = useAppContext();
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
      <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Mục tiêu Tiết kiệm
          </h3>
          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Thêm mục tiêu
          </button>
        </div>

        {hasCompletedGoals && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              Xem báo cáo mục tiêu đã hoàn thành
            </button>
          </div>
        )}

        {isLoadingData && (
          <p className="text-center text-slate-500 dark:text-slate-400 animate-pulse">
            Đang tải mục tiêu...
          </p>
        )}

        {!isLoadingData && goals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">
              Bạn chưa có mục tiêu nào.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Hãy bắt đầu đặt mục tiêu để hiện thực hóa ước mơ!
            </p>
          </div>
        )}

        {!isLoadingData && goals.length > 0 && (
          <div className="space-y-4">
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
