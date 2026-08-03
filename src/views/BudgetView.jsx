import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import DatePicker from "react-datepicker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/BudgetView.css";
import { Bar } from "react-chartjs-2";

export const BudgetView = () => {
  const {
    income,
    budgets,
    handleSetBudgets,
    formatCurrency,
    SPENDING_CATEGORIES,
    selectedMonthCategorySpending,
    selectedBudgetDate,
    setSelectedBudgetDate,
    user,
    showToast,
  } = useAppContext();

  const [localBudgets, setLocalBudgets] = useState(budgets || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);

  const totalBudgeted = useMemo(
    () =>
      Object.values(localBudgets).reduce(
        (sum, amount) => sum + (Number(amount) || 0),
        0
      ),
    [localBudgets]
  );

  const unallocated = income - totalBudgeted;
  const allocationPercentage = income > 0 ? Math.min(Math.round((totalBudgeted / income) * 100), 100) : 0;

  const handleBudgetChange = (category, amount) => {
    setIsSaved(false);
    setLocalBudgets((prev) => ({
      ...prev,
      [category]: Number(amount) >= 0 ? Number(amount) : 0,
    }));
  };

  const handleSave = () => {
    handleSetBudgets(localBudgets);
    setIsSaved(true);
    if (showToast) {
      showToast("Đã lưu ngân sách thành công!", "success");
    } else {
      alert("Đã lưu ngân sách thành công!");
    }
  };

  const handleCopyFromLastMonth = async () => {
    if (!user) return;

    const lastMonthDate = new Date(selectedBudgetDate);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const year = lastMonthDate.getFullYear();
    const month = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
    const lastMonthDocId = `${year}-${month}`;

    try {
      const docRef = doc(db, `users/${user.uid}/budgets`, lastMonthDocId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if (
          window.confirm(
            "Thao tác này sẽ ghi đè lên các thay đổi chưa lưu. Bạn có chắc chắn muốn sao chép ngân sách từ tháng trước không?"
          )
        ) {
          setLocalBudgets(docSnap.data());
          setIsSaved(false);
          if (showToast) {
            showToast("Đã sao chép ngân sách từ tháng trước!", "info");
          } else {
            alert("Đã sao chép ngân sách từ tháng trước. Nhấn 'Lưu Ngân sách' để xác nhận.");
          }
        }
      } else {
        if (showToast) {
          showToast("Không tìm thấy dữ liệu ngân sách tháng trước.", "error");
        } else {
          alert("Không tìm thấy dữ liệu ngân sách của tháng trước.");
        }
      }
    } catch (error) {
      console.error("Error copying budget:", error);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return SPENDING_CATEGORIES;
    return SPENDING_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [SPENDING_CATEGORIES, searchTerm]);

  // Over budget categories count
  const overBudgetCount = useMemo(() => {
    return SPENDING_CATEGORIES.filter((category) => {
      const budgetAmount = localBudgets[category] || 0;
      const spentAmount = selectedMonthCategorySpending[category] || 0;
      return budgetAmount > 0 && spentAmount > budgetAmount;
    }).length;
  }, [SPENDING_CATEGORIES, localBudgets, selectedMonthCategorySpending]);

  const chartData = useMemo(() => {
    const labels = Object.keys(localBudgets).filter((cat) => (localBudgets[cat] || 0) > 0);
    const budgetData = labels.map((label) => localBudgets[label] || 0);
    const spendingData = labels.map(
      (label) => selectedMonthCategorySpending[label] || 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Ngân sách",
          data: budgetData,
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: "Đã chi",
          data: spendingData,
          backgroundColor: "rgba(244, 63, 94, 0.7)",
          borderColor: "rgba(244, 63, 94, 1)",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [localBudgets, selectedMonthCategorySpending]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 12, weight: "600" },
          color: document.documentElement.classList.contains("dark")
            ? "#cbd5e1"
            : "#475569",
        },
      },
      title: {
        display: true,
        text: "So sánh Ngân sách & Chi tiêu thực tế",
        color: document.documentElement.classList.contains("dark")
          ? "#f1f5f9"
          : "#1e293b",
        font: { size: 14, weight: "bold" },
        padding: { bottom: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: { size: 11 },
          color: document.documentElement.classList.contains("dark")
            ? "#94a3b8"
            : "#6b7280",
          callback: (value) => {
            if (value >= 1000000) return `${value / 1000000}M`;
            if (value >= 1000) return `${value / 1000}k`;
            return value;
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: document.documentElement.classList.contains("dark")
            ? "#94a3b8"
            : "#6b7280",
        },
      },
    },
  };

  return (
    <div className="page-container">
      {/* Top Action & Navigation Header */}
      <div className="page-header">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="page-title">
                Quản lý Ngân sách
              </h2>
              {overBudgetCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  {overBudgetCount} vượt hạn mức
                </span>
              )}
            </div>
            <p className="page-subtitle">
              Đặt và kiểm soát hạn mức chi tiêu hàng tháng theo từng danh mục
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Date Picker với Icon Lịch */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <DatePicker
                selected={selectedBudgetDate}
                onChange={(date) => setSelectedBudgetDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all cursor-pointer shadow-sm"
              />
            </div>

            {/* Nút Sao chép */}
            <button
              onClick={handleCopyFromLastMonth}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-600/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Sao chép thiết lập ngân sách từ tháng trước"
            >
              <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Sao chép tháng trước</span>
            </button>

            {/* Nút Lưu Ngân Sách */}
            <button
              onClick={handleSave}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 text-white rounded-xl shadow-md active:scale-95 transition-all cursor-pointer ${
                isSaved
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isSaved ? "Đã lưu" : "Lưu Ngân sách"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-width Top Summary Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="summary-card income-card">
          <div className="summary-icon bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="summary-card-label">Tổng thu nhập</span>
            <p className="summary-card-value text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </p>
          </div>
        </div>

        <div className="summary-card budgeted-card">
          <div className="summary-icon bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="summary-card-label">Đã phân bổ</span>
            <p className="summary-card-value text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalBudgeted)}
            </p>
          </div>
        </div>

        <div className="summary-card unallocated-card">
          <div className={`summary-icon ${unallocated < 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400" : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="summary-card-label">Chưa phân bổ</span>
            <p className={`summary-card-value ${unallocated < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
              {formatCurrency(unallocated)}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Health Stats & Analytics Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Allocation Health Bar */}
          <div className="budget-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tỷ lệ phân bổ thu nhập
              </span>
              <span className={`text-xs font-bold ${unallocated < 0 ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"}`}>
                {allocationPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  unallocated < 0
                    ? "bg-rose-500"
                    : allocationPercentage > 90
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                }`}
                style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Comparative Chart Card */}
          {Object.keys(localBudgets).some((cat) => localBudgets[cat] > 0) && (
            <div className="budget-card p-5 flex-1 min-h-[300px] flex flex-col">
              <div className="chart-wrapper flex-1">
                <Bar options={chartOptions} data={chartData} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Category Budget Manager (7 cols) */}
        <div className="lg:col-span-7">
          <div className="budget-card p-5">
            {/* Category Manager Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/80">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Chi tiết Ngân sách theo Danh mục
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhập số tiền ngân sách tối đa cho từng khoản chi tiêu
                </p>
              </div>

              {/* Search Category */}
              <div className="relative w-full sm:w-60">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="category-search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Category List for Laptop Viewport */}
            <div className="budget-items-scrollable">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  Không tìm thấy danh mục phù hợp với "{searchTerm}"
                </div>
              ) : (
                filteredCategories.map((category, index) => {
                  const budgetAmount = localBudgets[category] || 0;
                  const spentAmount = selectedMonthCategorySpending[category] || 0;
                  const percentage =
                    budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

                  const isOver = budgetAmount > 0 && spentAmount > budgetAmount;
                  const isWarning = budgetAmount > 0 && percentage >= 85 && percentage <= 100;

                  const colors = [
                    "#6366f1",
                    "#8b5cf6",
                    "#ec4899",
                    "#f97316",
                    "#eab308",
                    "#10b981",
                    "#06b6d4",
                    "#3b82f6",
                  ];

                  return (
                    <div
                      key={category}
                      className={`category-item-card ${
                        isOver
                          ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        {/* Category Name & Status Badge */}
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`budget-${category}`}
                            className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            {category}
                          </label>

                          {isOver && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              Vượt {formatCurrency(spentAmount - budgetAmount)}
                            </span>
                          )}
                          {isWarning && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Sắp chạm ngưỡng ({Math.round(percentage)}%)
                            </span>
                          )}
                        </div>

                        {/* Spent / Budget display & Input */}
                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 dark:text-slate-400 block sm:inline mr-1">
                              Đã chi:
                            </span>
                            <span className={`text-xs font-bold ${isOver ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                              {formatCurrency(spentAmount)}
                            </span>
                          </div>

                          <div className="budget-input-wrapper">
                            <span className="budget-input-currency">đ</span>
                            <input
                              type="number"
                              id={`budget-${category}`}
                              value={localBudgets[category] || ""}
                              onChange={(e) =>
                                handleBudgetChange(category, e.target.value)
                              }
                              placeholder="0"
                              className="budget-input"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fg"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOver
                              ? "#ef4444"
                              : isWarning
                              ? "#f59e0b"
                              : colors[index % colors.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Floating Save Button for Mobile / Tablet */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(totalBudgeted)}</strong>
              </span>

              <button onClick={handleSave} className="save-bottom-btn">
                Lưu Ngân sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
