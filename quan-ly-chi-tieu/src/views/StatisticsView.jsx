import React, { useState, useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";

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
      return { spendingByCategory: {}, spendingByDay: {}, totalSpending: 0 };

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

    return { spendingByCategory, spendingByDay, totalSpending };
  }, [transactions, dateRange]);

  const chartData = {
    category: {
      labels: Object.keys(reportData.spendingByCategory),
      datasets: [
        {
          label: "Chi tiêu",
          data: Object.values(reportData.spendingByCategory),
          backgroundColor: [
            "#4f46e5",
            "#7c3aed",
            "#db2777",
            "#f97316",
            "#eab308",
            "#22c55e",
            "#06b6d4",
            "#3b82f6",
            "#64748b",
          ],
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
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          borderColor: "rgba(79, 70, 229, 1)",
          tension: 0.1,
        },
      ],
    },
  };

  const chartOptions = (title, displayScales = false) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains("dark")
            ? "#e2e8f0"
            : "#475569",
        },
      },
      title: {
        display: true,
        text: title,
        color: document.documentElement.classList.contains("dark")
          ? "#f1f5f9"
          : "#1e293b",
        font: { size: 16 },
      },
    },
    scales: displayScales
      ? {
          y: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#94a3b8"
                : "#6b7280",
            },
          },
          x: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#94a3b8"
                : "#6b7280",
            },
          },
        }
      : {},
  });

  const FilterButton = ({ label, preset }) => (
    <button
      onClick={() => handlePresetClick(preset)}
      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
        activePreset === preset
          ? "bg-indigo-600 text-white"
          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Lọc Báo cáo
        </h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <FilterButton label="Tháng này" preset="thisMonth" />
            <FilterButton label="Tháng trước" preset="lastMonth" />
            <FilterButton label="Năm nay" preset="thisYear" />
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
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
              className="w-32 p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span>-</span>
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
              className="w-32 p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>
      {reportData.totalSpending > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
            <Line
              options={chartOptions("Xu hướng chi tiêu", true)}
              data={chartData.trend}
            />
          </div>
          <div className="xl:col-span-2 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">
              Tỷ trọng chi tiêu
            </h4>
            <Pie options={chartOptions("", false)} data={chartData.category} />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-12 text-center">
          <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Không có dữ liệu
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Không tìm thấy giao dịch chi tiêu nào trong khoảng thời gian đã
            chọn.
          </p>
        </div>
      )}
    </div>
  );
};
