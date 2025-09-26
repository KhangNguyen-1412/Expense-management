import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { DashboardView } from "../views/DashboardView";
import { HistoryView } from "../views/HistoryView";
import { AddTransactionView } from "../views/AddTransactionView";
import { BudgetView } from "../views/BudgetView";
import { StatisticsView } from "../views/StatisticsView";
import { SettingsView } from "../views/SettingsView";

export const MainContent = () => {
  const {
    activeView,
    authError,
    isLoadingAuth,
    isLoadingData,
    user,
    transactions,
    income,
    expense,
    total,
    budgets,
    handleAnalyzeSpending,
    analysis,
    isLoadingAnalysis,
    analysisError,
    formatCurrency,
    handleDeleteTransaction,
    handleAddTransaction,
    handleSetBudgets,
  } = useAppContext();

  if (authError) {
    return (
      <div className="w-full text-center p-10 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-xl">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
          Lỗi Kết Nối
        </h2>
        <p className="text-red-600 dark:text-red-400 font-medium">
          {authError}
        </p>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Vui lòng kiểm tra lại cấu hình và tải lại trang.
        </p>
      </div>
    );
  }

  if (isLoadingAuth || (user && isLoadingData)) {
    return (
      <div className="w-full text-center p-10">
        <p className="animate-pulse font-medium text-slate-500 dark:text-slate-400">
          Đang kết nối đến máy chủ...
        </p>
      </div>
    );
  }

  switch (activeView) {
    case "history":
      return (
        <HistoryView
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
        />
      );
    case "settings":
      return <SettingsView />;
    case "add":
      return <AddTransactionView onAddTransaction={handleAddTransaction} />;
    case "budget":
      return (
        <BudgetView
          income={income}
          budgets={budgets}
          onSetBudgets={handleSetBudgets}
          formatCurrency={formatCurrency}
        />
      );
    case "statistics":
      return (
        <StatisticsView
          transactions={transactions}
          formatCurrency={formatCurrency}
        />
      );
    case "dashboard":
    default:
      return (
        <DashboardView
          transactions={transactions}
          income={income}
          expense={expense}
          total={total}
          budgets={budgets}
          handleAnalyzeSpending={handleAnalyzeSpending}
          analysis={analysis}
          isLoading={isLoadingAnalysis}
          error={analysisError}
          formatCurrency={formatCurrency}
        />
      );
  }
};
