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
  } = useAppContext();

  const [localBudgets, setLocalBudgets] = useState(budgets || {});

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

  const handleBudgetChange = (category, amount) => {
    setLocalBudgets((prev) => ({
      ...prev,
      [category]: Number(amount) >= 0 ? Number(amount) : 0,
    }));
  };

  const handleSave = () => {
    handleSetBudgets(localBudgets);
  };

  const handleCopyFromLastMonth = async () => {
    if (!user) return;

    const lastMonthDate = new Date(selectedBudgetDate);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const year = lastMonthDate.getFullYear();
    const month = String(lastMonthDate.getMonth() + 1).padStart(2, "0");
    const lastMonthDocId = `${year}-${month}`;

    const docRef = doc(db, `users/${user.uid}/budgets`, lastMonthDocId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (
        window.confirm(
          "Thao tác này sẽ ghi đè lên các thay đổi chưa lưu. Bạn có chắc chắn muốn sao chép ngân sách từ tháng trước không?"
        )
      ) {
        setLocalBudgets(docSnap.data());
        alert(
          "Đã sao chép ngân sách từ tháng trước. Nhấn 'Lưu Ngân sách' để xác nhận."
        );
      }
    } else {
      alert("Không tìm thấy dữ liệu ngân sách của tháng trước.");
    }
  };

  const chartData = useMemo(() => {
    const labels = Object.keys(budgets).filter((cat) => budgets[cat] > 0);
    const budgetData = labels.map((label) => budgets[label]);
    const spendingData = labels.map(
      (label) => selectedMonthCategorySpending[label] || 0
    );

    return {
      labels,
      datasets: [
        {
          label: "Ngân sách",
          data: budgetData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Đã chi",
          data: spendingData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [budgets, selectedMonthCategorySpending]);

  const chartOptions = {
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
        text: "So sánh Ngân sách và Chi tiêu",
        color: document.documentElement.classList.contains("dark")
          ? "#f1f5f9"
          : "#1e293b",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
    },
  };

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h3 className="budget-title">Ngân sách</h3>
        <div className="datepicker-wrapper">
          <DatePicker
            selected={selectedBudgetDate}
            onChange={(date) => setSelectedBudgetDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="budget-datepicker"
          />
        </div>
      </div>
      <div className="copy-budget-container">
        <button
          onClick={handleCopyFromLastMonth}
          className="copy-budget-button"
        >
          Sao chép ngân sách từ tháng trước
        </button>
      </div>
      <div className="budget-summary">
        <div>
          <h4 className="summary-title">Tổng thu nhập</h4>
          <p className="summary-value summary-value-income">
            {formatCurrency(income)}
          </p>
        </div>
        <div>
          <h4 className="summary-title">Đã phân bổ</h4>
          <p className="summary-value summary-value-budgeted">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
        <div>
          <h4 className="summary-title">Chưa phân bổ</h4>
          <p
            className={`summary-value ${
              unallocated < 0
                ? "summary-value-negative"
                : "summary-value-positive"
            }`}
          >
            {formatCurrency(unallocated)}
          </p>
        </div>
      </div>
      {Object.keys(budgets).length > 0 && (
        <div className="chart-container">
          <Bar options={chartOptions} data={chartData} />
        </div>
      )}
      <div className="budget-items-container">
        {SPENDING_CATEGORIES.map((category, index) => {
          const budgetAmount = localBudgets[category] || 0;
          const spentAmount = selectedMonthCategorySpending[category] || 0;
          const percentage =
            budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
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
            <div key={category}>
              <div className="budget-item-header">
                <label
                  htmlFor={`budget-${category}`}
                  className="budget-item-label"
                >
                  {category}
                </label>
                <div className="budget-item-details">
                  <span className="budget-item-spent">
                    {formatCurrency(spentAmount)} /{" "}
                    {formatCurrency(budgetAmount)}
                  </span>
                  <div className="budget-input-wrapper">
                    <span className="budget-input-currency">VND</span>
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
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fg"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor:
                      percentage > 100
                        ? "#ef4444"
                        : colors[index % colors.length],
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleSave} className="btn btn-primary w-full mt-8">
        Lưu Ngân sách
      </button>
    </div>
  );
};
