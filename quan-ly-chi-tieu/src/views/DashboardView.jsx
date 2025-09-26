import React from "react";
import { BudgetStatus } from "../components/BudgetStatus";
import { AnalysisResult } from "../components/AnalysisResult";
import { useAppContext } from "../context/AppContext";

export const DashboardView = () => {
  const {
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
  } = useAppContext();

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-8">
        <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Số dư của bạn
        </h2>
        <p className="text-6xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
          {formatCurrency(total)}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 flex items-center">
          <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg uppercase text-slate-500 dark:text-slate-400 font-semibold">
              Thu nhập
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
              {formatCurrency(income)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 flex items-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg uppercase text-slate-500 dark:text-slate-400 font-semibold">
              Chi tiêu
            </h3>
            <p className="text-3xl font-bold text-red-500">
              {formatCurrency(Math.abs(expense))}
            </p>
          </div>
        </div>
      </div>
      <BudgetStatus />
      <div>
        <button
          onClick={handleAnalyzeSpending}
          disabled={isLoadingAnalysis}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V5a1 1 0 00-1-1H8a1 1 0 00-1 1v1H5V4z" />
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 9a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM6 11.5a.5.5 0 000 1h3a.5.5 0 000-1H6zM8.5 7a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 4a.5.5 0 000 1h2a.5.5 0 000-1h-2z"
              clipRule="evenodd"
            />
          </svg>
          Phân tích với AI
        </button>
        <AnalysisResult
          analysis={analysis}
          isLoading={isLoadingAnalysis}
          error={analysisError}
        />
      </div>
    </div>
  );
};
