import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { ContributeToGoalDialog } from "./ContributeToGoalDialog";
import { EditGoalDialog } from "./EditGoalDialog";
import { GoalHistoryDialog } from "./GoalHistoryDialog";

export const GoalItem = ({ goal }) => {
  const { formatCurrency, handleDeleteGoal } = useAppContext();
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const progress =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <>
      <ContributeToGoalDialog
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        goal={goal}
      />
      <EditGoalDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        goal={goal}
      />
      <GoalHistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        goal={goal}
      />
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-200 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600">
        <div
          className="flex justify-between items-start cursor-pointer"
          onClick={() => setIsHistoryOpen(true)}
        >
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {goal.name}
              </h4>
              {progress >= 100 && (
                <span className="px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full animate-pulse">
                  Đã hoàn thành
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đã đạt được:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(goal.currentAmount)}
              </span>{" "}
              / {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsContributeOpen(true)}
              disabled={progress >= 100}
              className="px-3 py-1.5 text-sm bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Gửi tiền
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-500 rounded-full transition-colors"
              aria-label="Chỉnh sửa mục tiêu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteGoal(goal.id, goal.name)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-500 rounded-full transition-colors"
              aria-label="Xóa mục tiêu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-right text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>
    </>
  );
};
