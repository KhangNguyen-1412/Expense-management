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
      <div className="savings-goals-container">
        <div className="savings-goals-header">
          <h3 className="savings-goals-title">Mục tiêu Tiết kiệm</h3>
          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            + Thêm mục tiêu
          </button>
        </div>

        {hasCompletedGoals && (
          <div className="completed-goals-report-container">
            <button
              onClick={() => setIsReportOpen(true)}
              className="completed-goals-report-button"
            >
              Xem báo cáo mục tiêu đã hoàn thành
            </button>
          </div>
        )}

        {isLoadingData && <p className="loading-text">Đang tải mục tiêu...</p>}

        {!isLoadingData && goals.length === 0 && (
          <div className="no-goals-container">
            <p className="no-goals-text">Bạn chưa có mục tiêu nào.</p>
            <p className="no-goals-text mt-2">
              Hãy bắt đầu đặt mục tiêu để hiện thực hóa ước mơ!
            </p>
          </div>
        )}

        {!isLoadingData && goals.length > 0 && (
          <div className="goals-list">
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
