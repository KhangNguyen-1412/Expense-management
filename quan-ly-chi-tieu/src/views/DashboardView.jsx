import React from "react";
import { BudgetStatus } from "../components/BudgetStatus";
import { AnalysisResult } from "../components/AnalysisResult";
import { useAppContext } from "../context/AppContext";
import "../styles/DashboardView.css";

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
    <div className="dashboard-container">
      <div className="balance-card">
        <h2 className="balance-title">Số dư của bạn</h2>
        <p className="balance-amount">{formatCurrency(total)}</p>
      </div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon-wrapper summary-icon-income">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="summary-icon summary-icon-income-color"
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
            <h3 className="summary-title">Thu nhập</h3>
            <p className="summary-amount summary-amount-income">
              {formatCurrency(income)}
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon-wrapper summary-icon-expense">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="summary-icon summary-icon-expense-color"
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
            <h3 className="summary-title">Chi tiêu</h3>
            <p className="summary-amount summary-amount-expense">
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
          className="ai-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ai-button-icon"
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
