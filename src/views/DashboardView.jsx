import React, { useMemo } from "react";
import { BudgetStatus } from "../components/BudgetStatus";
import { AnalysisResult } from "../components/AnalysisResult";
import { TransactionIcon } from "../components/TransactionIcon";
import { useAppContext } from "../context/AppContext";
import "../styles/DashboardView.css";

export const DashboardView = () => {
  const {
    transactions,
    income,
    expense,
    total,
    handleAnalyzeSpending,
    analysis,
    isLoadingAnalysis,
    analysisError,
    formatCurrency,
    setActiveView,
  } = useAppContext();

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  // This month stats
  const monthStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTx = transactions.filter((t) => {
      const d = t.createdAt?.seconds
        ? new Date(t.createdAt.seconds * 1000)
        : null;
      return d && d >= startOfMonth;
    });

    const expenseCount = thisMonthTx.filter((t) => t.amount < 0).length;
    const incomeCount = thisMonthTx.filter((t) => t.amount > 0).length;

    return {
      totalTx: thisMonthTx.length,
      expenseCount,
      incomeCount,
    };
  }, [transactions]);

  const formatDate = (ts) => {
    if (!ts?.seconds) return "";
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="page-container">
      {/* Hero Balance Banner */}
      <div className="dashboard-hero">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <span className="hero-label">Số dư hiện tại</span>
              <h2 className="hero-balance">{formatCurrency(total)}</h2>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hero-stat-card">
                <div className="hero-stat-icon bg-emerald-500/20">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div>
                  <span className="hero-stat-label">Thu nhập</span>
                  <span className="hero-stat-value text-emerald-400">{formatCurrency(income)}</span>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-icon bg-rose-500/20">
                  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div>
                  <span className="hero-stat-label">Chi tiêu</span>
                  <span className="hero-stat-value text-rose-400">{formatCurrency(Math.abs(expense))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Số dư</span>
            <span className={`kpi-value block ${total >= 0 ? "text-slate-800 dark:text-slate-100" : "text-rose-600"}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Thu nhập tháng</span>
            <span className="kpi-value block text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-rose-100 dark:bg-rose-900/30">
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Chi tiêu tháng</span>
            <span className="kpi-value block text-rose-600 dark:text-rose-400">
              {formatCurrency(Math.abs(expense))}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-amber-100 dark:bg-amber-900/30">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Giao dịch tháng</span>
            <span className="kpi-value block text-amber-600 dark:text-amber-400">
              {monthStats.totalTx}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Recent Transactions Card */}
          <div className="page-card p-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-3">
              <h3 className="page-card-title">Giao dịch gần đây</h3>
              <button
                onClick={() => setActiveView("history")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Xem tất cả →
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm font-medium">Chưa có giao dịch nào</p>
                <p className="text-xs mt-1">Bắt đầu thêm giao dịch để theo dõi chi tiêu!</p>
              </div>
            ) : (
              <div>
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="recent-tx-item">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`recent-tx-icon ${tx.amount >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"}`}>
                        <TransactionIcon category={tx.category} className="w-5 h-5 mr-0" />
                      </div>
                      <div className="min-w-0">
                        <span className="recent-tx-name block">{tx.text}</span>
                        <span className="recent-tx-category">{tx.category || "Khác"}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={`recent-tx-amount block ${tx.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </span>
                      <span className="recent-tx-date">{formatDate(tx.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Status Card */}
          <div className="page-card p-5">
            <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
              Tình hình Ngân sách
            </h3>
            <BudgetStatus />
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Analysis Card */}
          <div className="ai-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Phân tích thông minh</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dùng AI để tìm hiểu xu hướng chi tiêu</p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeSpending}
              disabled={isLoadingAnalysis}
              className="ai-btn"
            >
              {isLoadingAnalysis ? (
                <>
                  <svg className="animate-spin ai-btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang phân tích...
                </>
              ) : (
                <>
                  <svg className="ai-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Phân tích với AI
                </>
              )}
            </button>

            <AnalysisResult
              analysis={analysis}
              isLoading={isLoadingAnalysis}
              error={analysisError}
            />
          </div>

          {/* Month Summary Mini Card */}
          <div className="page-card p-5">
            <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
              Thống kê nhanh tháng này
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Giao dịch thu nhập:</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{monthStats.incomeCount}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Giao dịch chi tiêu:</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{monthStats.expenseCount}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Tổng giao dịch:</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{monthStats.totalTx}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
