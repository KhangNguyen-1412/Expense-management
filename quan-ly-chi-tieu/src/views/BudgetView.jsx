import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import DatePicker from "react-datepicker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
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
    <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-0">
          Ngân sách
        </h3>
        <div className="w-full sm:w-48">
          <DatePicker
            selected={selectedBudgetDate}
            onChange={(date) => setSelectedBudgetDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-center font-semibold"
          />
        </div>
      </div>
      <div className="mb-6 text-center">
        <button
          onClick={handleCopyFromLastMonth}
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sao chép ngân sách từ tháng trước
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
        <div>
          <h4 className="text-slate-500 dark:text-slate-400 font-semibold">
            Tổng thu nhập
          </h4>
          <p className="font-bold text-2xl text-green-600 dark:text-green-500 mt-1">
            {formatCurrency(income)}
          </p>
        </div>
        <div>
          <h4 className="text-slate-500 dark:text-slate-400 font-semibold">
            Đã phân bổ
          </h4>
          <p className="font-bold text-2xl text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
        <div>
          <h4 className="text-slate-500 dark:text-slate-400 font-semibold">
            Chưa phân bổ
          </h4>
          <p
            className={`font-bold text-2xl mt-1 ${
              unallocated < 0
                ? "text-red-600 dark:text-red-500"
                : "text-orange-500"
            }`}
          >
            {formatCurrency(unallocated)}
          </p>
        </div>
      </div>
      {Object.keys(budgets).length > 0 && (
        <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <Bar options={chartOptions} data={chartData} />
        </div>
      )}
      <div className="space-y-6">
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
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <label
                  htmlFor={`budget-${category}`}
                  className="font-semibold text-slate-700 dark:text-slate-300"
                >
                  {category}
                </label>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex-grow sm:flex-grow-0 text-right">
                    {formatCurrency(spentAmount)} /{" "}
                    {formatCurrency(budgetAmount)}
                  </span>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      VND
                    </span>
                    <input
                      type="number"
                      id={`budget-${category}`}
                      value={localBudgets[category] || ""}
                      onChange={(e) =>
                        handleBudgetChange(category, e.target.value)
                      }
                      placeholder="0"
                      className="w-full p-2 pl-10 text-right font-semibold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
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
      <button
        onClick={handleSave}
        className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 text-lg"
      >
        Lưu Ngân sách
      </button>
    </div>
  );
};
