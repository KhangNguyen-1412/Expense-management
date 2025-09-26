import React, { memo } from "react";
import { useAppContext } from "../context/AppContext";

const BudgetStatusComponent = () => {
  const {
    budgets,
    formatCurrency,
    selectedMonthCategorySpending: currentMonthCategorySpending,
  } = useAppContext();

  if (Object.keys(budgets).length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Bạn chưa thiết lập ngân sách. Hãy vào mục "Ngân sách" để bắt đầu.</p>
      </div>
    );
  }

  const colors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
  ];

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-5">
        Tình hình Ngân sách
      </h3>
      <div className="space-y-5">
        {Object.entries(budgets).map(([category, budgetAmount], index) => {
          if (budgetAmount <= 0) return null;
          const spentAmount = currentMonthCategorySpending[category] || 0;
          const percentage =
            budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
          const remaining = budgetAmount - spentAmount;
          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {category}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor:
                      percentage > 100
                        ? "#ef4444"
                        : colors[index % colors.length],
                  }}
                ></div>
              </div>
              <p
                className={`text-sm text-right mt-1.5 font-medium ${
                  remaining < 0
                    ? "text-red-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {remaining >= 0
                  ? `Còn lại: ${formatCurrency(remaining)}`
                  : `Vượt mức: ${formatCurrency(Math.abs(remaining))}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BudgetStatus = memo(BudgetStatusComponent);
