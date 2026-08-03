import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { VoiceGuideDialog } from "../components/VoiceGuideDialog";
import "../styles/AddTransactionView.css";

export const AddTransactionView = () => {
  const {
    handleAddTransaction,
    handleUpdateTransaction,
    transactionToEdit,
    cancelEdit,
    SPENDING_CATEGORIES,
    formatCurrency,
    showToast,
  } = useAppContext();

  const isEditing = !!transactionToEdit;

  const [transactionType, setTransactionType] = useState("expense"); // "expense" | "income"
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(SPENDING_CATEGORIES[0] || "Ăn uống");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && transactionToEdit) {
      setText(transactionToEdit.text || "");
      const rawAmt = Number(transactionToEdit.amount) || 0;
      if (rawAmt < 0) {
        setTransactionType("expense");
        setAmount(String(Math.abs(rawAmt)));
      } else {
        setTransactionType("income");
        setAmount(String(rawAmt));
      }
      setCategory(transactionToEdit.category || SPENDING_CATEGORIES[0] || "Khác");
    } else {
      setText("");
      setAmount("");
      setTransactionType("expense");
      setCategory(SPENDING_CATEGORIES[0] || "Ăn uống");
    }
  }, [transactionToEdit, isEditing, SPENDING_CATEGORIES]);

  // Handle Quick Amount Addition
  const handleQuickAddAmount = (addValue) => {
    const currentNum = Number(amount) || 0;
    setAmount(String(currentNum + addValue));
  };

  // Quick Tags
  const quickTags = transactionType === "expense"
    ? ["Cà phê", "Ăn sáng", "Ăn trưa", "Xăng xe", "Đi chợ", "Mua sắm", "Tiền điện/nước"]
    : ["Lương tháng", "Thưởng", "Bán hàng", "Tiền lãi", "Được cho/tặng"];

  // Category Icon & Color Mapping
  const categoryMeta = {
    "Ăn uống": { icon: "🍔", bg: "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400" },
    "Đi lại": { icon: "🚗", bg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" },
    "Hóa đơn": { icon: "🧾", bg: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400" },
    "Mua sắm": { icon: "🛍️", bg: "bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400" },
    "Giải trí": { icon: "🎬", bg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400" },
    "Sức khỏe": { icon: "💊", bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" },
    "Giáo dục": { icon: "📚", bg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400" },
    "Gia đình": { icon: "🏠", bg: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" },
    "Tiết kiệm": { icon: "💰", bg: "bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400" },
    "Khác": { icon: "📦", bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      if (showToast) showToast("Vui lòng nhập tên giao dịch.", "error");
      else alert("Vui lòng nhập tên giao dịch.");
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      if (showToast) showToast("Vui lòng nhập số tiền hợp lệ (> 0).", "error");
      else alert("Vui lòng nhập số tiền hợp lệ (> 0).");
      return;
    }

    // Convert to signed amount for storage: Expense is negative, Income is positive
    const finalSignedAmount = transactionType === "expense" ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    const transactionData = {
      text: text.trim(),
      amount: finalSignedAmount,
      category: transactionType === "expense" ? category : null,
      date: isEditing && transactionToEdit?.date ? transactionToEdit.date : new Date(),
    };

    if (isEditing) {
      handleUpdateTransaction(transactionToEdit.id, transactionData);
      if (showToast) showToast("Đã cập nhật giao dịch thành công!", "success");
    } else {
      handleAddTransaction(transactionData);
      if (showToast) showToast("Đã thêm giao dịch thành công!", "success");

      // Reset Form
      setText("");
      setAmount("");
    }
  };

  const numericVal = Number(amount) || 0;
  const formattedPreviewAmount = formatCurrency ? formatCurrency(transactionType === "expense" ? -numericVal : numericVal) : `${numericVal.toLocaleString('vi-VN')} đ`;

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <h2 className="page-title">
          {isEditing ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
        </h2>
        <p className="page-subtitle">
          Ghi chép thu chi hàng ngày nhanh chóng & chính xác
        </p>
      </div>

      {/* Main 2-Column Responsive Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7">
          <div className="page-card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher: Expense vs Income */}
              <div>
                <label className="input-field-label">Loại giao dịch</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setTransactionType("expense")}
                    className={`type-tab-btn ${
                      transactionType === "expense"
                        ? "active-expense"
                        : "inactive-tab"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Chi tiêu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransactionType("income")}
                    className={`type-tab-btn ${
                      transactionType === "income"
                        ? "active-income"
                        : "inactive-tab"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Thu nhập</span>
                  </button>
                </div>
              </div>

              {/* Amount Input Section */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="amount" className="input-field-label">
                    Số tiền (VNĐ)
                  </label>
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Xóa số tiền
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className={`amount-currency-prefix ${transactionType === "expense" ? "text-rose-500" : "text-emerald-500"}`}>
                    {transactionType === "expense" ? "-" : "+"}
                  </span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="styled-amount-input"
                    min="0"
                    step="any"
                  />
                  <span className="amount-unit-suffix">đ</span>
                </div>

                {/* Formatted Currency Hint */}
                {numericVal > 0 && (
                  <p className="mt-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">
                    = {formattedPreviewAmount}
                  </p>
                )}

                {/* Quick Amount Shortcut Presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[50000, 100000, 200000, 500000, 1000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAddAmount(val)}
                      className="preset-badge"
                    >
                      +{val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Description Field */}
              <div>
                <label htmlFor="text" className="input-field-label">
                  Nội dung giao dịch
                </label>
                <input
                  type="text"
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="VD: Cà phê, Tiền điện, Lương tháng 8..."
                  className="styled-text-input"
                />

                {/* Quick Suggestion Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-400 font-medium self-center mr-1">
                    Gợi ý:
                  </span>
                  {quickTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setText(tag)}
                      className="quick-tag-chip"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector Grid (Shown for Expense) */}
              {transactionType === "expense" && (
                <div>
                  <label className="input-field-label">Hạng mục chi tiêu</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mt-2">
                    {SPENDING_CATEGORIES.map((cat) => {
                      const meta = categoryMeta[cat] || { icon: "📌", bg: "bg-slate-100 text-slate-600" };
                      const isSelected = category === cat;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`category-grid-card ${
                            isSelected
                              ? "selected-category-card"
                              : "unselected-category-card"
                          }`}
                        >
                          <span className={`category-card-icon ${meta.bg}`}>
                            {meta.icon}
                          </span>
                          <span className="category-card-label">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="cancel-form-btn"
                  >
                    Hủy bỏ
                  </button>
                )}
                <button
                  type="submit"
                  className={`submit-form-btn ${
                    transactionType === "expense"
                      ? "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-500/25"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/25"
                  }`}
                >
                  {isEditing ? "Cập nhật giao dịch" : "Thêm giao dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Preview Card & Voice Tips (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Preview Card */}
          <div className="transaction-preview-card">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Xem trước giao dịch
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                transactionType === "expense"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              }`}>
                {transactionType === "expense" ? "Chi tiêu" : "Thu nhập"}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    transactionType === "expense"
                      ? (categoryMeta[category]?.bg || "bg-slate-200")
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  }`}>
                    {transactionType === "expense" ? (categoryMeta[category]?.icon || "💸") : "💵"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {text.trim() || "Tên giao dịch..."}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {transactionType === "expense" ? (category || "Chưa chọn danh mục") : "Khoản thu nhập"} • Hôm nay
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-extrabold block ${
                    transactionType === "expense"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {formattedPreviewAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Assistant Tip Box */}
          <div className="voice-tip-card">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Thêm nhanh bằng giọng nói
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Nhấn biểu tượng chiếc micro ở danh mục bên trái hoặc nói các câu lệnh ngắn như:
                </p>
                <div className="mt-2.5 space-y-1.5">
                  <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
                    🗣️ "Cà phê 45 nghìn"
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
                    🗣️ "Lương tháng 15 triệu"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
