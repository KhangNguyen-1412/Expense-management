import React, { useState, useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "../styles/StatisticsView.css";

const RANKING_COLORS = [
  "#4f46e5", "#7c3aed", "#db2777", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#64748b",
];

export const StatisticsView = ({ transactions, formatCurrency }) => {
  const [activePreset, setActivePreset] = useState("thisMonth");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const handlePresetClick = (preset) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        break;
    }
    setActivePreset(preset);
    setDateRange({ startDate: start, endDate: end });
  };

  const reportData = useMemo(() => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate)
      return { spendingByCategory: {}, spendingByDay: {}, totalSpending: 0, totalIncome: 0 };

    const startOfDay = new Date(startDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(endDate.setHours(23, 59, 59, 999));

    const filtered = transactions.filter((t) => {
      const transDate = t.createdAt?.seconds
        ? new Date(t.createdAt.seconds * 1000)
        : new Date(0);
      return transDate >= startOfDay && transDate <= endOfDay;
    });

    const spendingByCategory = filtered
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.category || "Khác";
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const spendingByDay = filtered
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        const day = new Date(t.createdAt.seconds * 1000).toLocaleDateString(
          "vi-VN",
          { day: "2-digit", month: "2-digit" }
        );
        acc[day] = (acc[day] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const totalSpending = Object.values(spendingByCategory).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const totalIncome = filtered
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return { spendingByCategory, spendingByDay, totalSpending, totalIncome };
  }, [transactions, dateRange]);

  // Top categories sorted
  const topCategories = useMemo(() => {
    return Object.entries(reportData.spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);
  }, [reportData.spendingByCategory]);

  // Average per day
  const avgPerDay = useMemo(() => {
    const dayCount = Object.keys(reportData.spendingByDay).length;
    return dayCount > 0 ? reportData.totalSpending / dayCount : 0;
  }, [reportData]);

  // Top spending category
  const topCategory = topCategories.length > 0 ? topCategories[0] : null;

  const chartData = {
    category: {
      labels: Object.keys(reportData.spendingByCategory),
      datasets: [
        {
          label: "Chi tiêu",
          data: Object.values(reportData.spendingByCategory),
          backgroundColor: RANKING_COLORS,
          borderColor: document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    trend: {
      labels: Object.keys(reportData.spendingByDay),
      datasets: [
        {
          label: "Chi tiêu hàng ngày",
          data: Object.values(reportData.spendingByDay),
          fill: true,
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          borderColor: "rgba(79, 70, 229, 1)",
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: "rgba(79, 70, 229, 1)",
        },
      ],
    },
  };

  const chartOptions = (title, displayScales = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains("dark")
            ? "#e2e8f0"
            : "#475569",
          font: { size: 11 },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: document.documentElement.classList.contains("dark")
          ? "#f1f5f9"
          : "#1e293b",
        font: { size: 14, weight: "bold" },
      },
    },
    scales: displayScales
      ? {
          y: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#94a3b8"
                : "#6b7280",
              font: { size: 10 },
            },
            grid: {
              color: document.documentElement.classList.contains("dark")
                ? "rgba(148, 163, 184, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#94a3b8"
                : "#6b7280",
              font: { size: 10 },
            },
            grid: {
              display: false,
            },
          },
        }
      : {},
  });

  const FilterButton = ({ label, preset }) => (
    <button
      onClick={() => handlePresetClick(preset)}
      className={`filter-pill ${
        activePreset === preset ? "filter-pill-active" : "filter-pill-inactive"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="page-container">
      {/* Header Banner with Filter */}
      <div className="page-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="page-title">
              Báo cáo Chi tiêu
            </h2>
            <p className="page-subtitle">
              Phân tích xu hướng và tỷ trọng chi tiêu theo danh mục
            </p>
          </div>

          <div className="filter-section">
            <div className="filter-presets">
              <FilterButton label="Tháng này" preset="thisMonth" />
              <FilterButton label="Tháng trước" preset="lastMonth" />
              <FilterButton label="Năm nay" preset="thisYear" />
            </div>
            <div className="datepicker-container">
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => {
                  setDateRange((prev) => ({ ...prev, startDate: date }));
                  setActivePreset(null);
                }}
                selectsStart
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                dateFormat="dd/MM/yyyy"
                className="stats-datepicker"
              />
              <span className="text-slate-400 text-sm">→</span>
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => {
                  setDateRange((prev) => ({ ...prev, endDate: date }));
                  setActivePreset(null);
                }}
                selectsEnd
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                minDate={dateRange.startDate}
                dateFormat="dd/MM/yyyy"
                className="stats-datepicker"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-rose-100 dark:bg-rose-900/30">
            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Tổng chi tiêu</span>
            <span className="kpi-value block text-rose-600 dark:text-rose-400">
              {formatCurrency(reportData.totalSpending)}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-amber-100 dark:bg-amber-900/30">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Trung bình / ngày</span>
            <span className="kpi-value block text-amber-600 dark:text-amber-400">
              {formatCurrency(Math.round(avgPerDay))}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="kpi-label">Chi nhiều nhất</span>
            <span className="kpi-value block text-indigo-600 dark:text-indigo-400 text-base truncate">
              {topCategory ? topCategory[0] : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Rankings */}
      {reportData.totalSpending > 0 ? (
        <div className="charts-grid">
          {/* Line Chart - Trend */}
          <div className="lg:col-span-7 page-card p-5">
            <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">Xu hướng chi tiêu theo ngày</h3>
            <div className="h-[280px] sm:h-[320px]">
              <Line
                options={chartOptions("", true)}
                data={chartData.trend}
              />
            </div>
          </div>

          {/* Pie Chart + Ranking */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="page-card p-5">
              <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">Tỷ trọng chi tiêu</h3>
              <div className="flex justify-center">
                <div className="w-[220px] h-[220px] sm:w-[250px] sm:h-[250px]">
                  <Pie options={chartOptions("", false)} data={chartData.category} />
                </div>
              </div>
            </div>

            {/* Top Categories Ranking */}
            <div className="page-card p-5">
              <h3 className="page-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">Xếp hạng Danh mục</h3>
              <div className="space-y-1">
                {topCategories.map(([category, amount], index) => {
                  const maxAmount = topCategories[0]?.[1] || 1;
                  const pct = (amount / maxAmount) * 100;
                  return (
                    <div key={category} className="ranking-item">
                      <span
                        className="ranking-badge"
                        style={{ backgroundColor: RANKING_COLORS[index % RANKING_COLORS.length] }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {category}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="ranking-bar-bg">
                          <div
                            className="ranking-bar-fg"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: RANKING_COLORS[index % RANKING_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-card">
          <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="no-data-title">Không có dữ liệu</h4>
          <p className="no-data-description">
            Không tìm thấy giao dịch chi tiêu nào trong khoảng thời gian đã chọn.
          </p>
        </div>
      )}
    </div>
  );
};
