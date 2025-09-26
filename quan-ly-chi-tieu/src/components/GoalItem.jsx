import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { ContributeToGoalDialog } from "./ContributeToGoalDialog";

export const GoalItem = ({ goal }) => {
  const { formatCurrency } = useAppContext();
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  const progress =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <>
      <ContributeToGoalDialog
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        goal={goal}
      />
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {goal.name}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đã đạt được:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(goal.currentAmount)}
              </span>{" "}
              / {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <button
            onClick={() => setIsContributeOpen(true)}
            className="px-3 py-1.5 text-sm bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
          >
            Gửi tiền
          </button>
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
