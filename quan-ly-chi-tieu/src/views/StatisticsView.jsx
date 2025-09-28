import React, { useState, useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "../styles/StatisticsView.css";

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
      className={`filter-btn ${
        activePreset === preset ? "filter-btn-active" : "filter-btn-inactive"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="statistics-container">
      <div className="filter-card">
        <h3 className="filter-title">Lọc Báo cáo</h3>
        <div className="filter-controls">
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
              className="stats-datepicker"
            />
          </div>
        </div>
      </div>
      {reportData.totalSpending > 0 ? (
        <div className="charts-grid">
          <div className="chart-wrapper chart-wrapper-line">
            <Line
              options={chartOptions("Xu hướng chi tiêu", true)}
              data={chartData.trend}
            />
          </div>
          <div className="chart-wrapper chart-wrapper-pie">
            <h4 className="pie-chart-title">Tỷ trọng chi tiêu</h4>
            <Pie options={chartOptions("", false)} data={chartData.category} />
          </div>
        </div>
      ) : (
        <div className="no-data-card">
          <h4 className="no-data-title">Không có dữ liệu</h4>
          <p className="no-data-description">
            Không tìm thấy giao dịch chi tiêu nào trong khoảng thời gian đã
            chọn.
          </p>
        </div>
      )}
    </div>
  );
};
