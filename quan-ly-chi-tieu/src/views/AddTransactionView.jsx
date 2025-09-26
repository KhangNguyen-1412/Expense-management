import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export const AddTransactionView = () => {
  const {
    handleAddTransaction,
    handleUpdateTransaction,
    transactionToEdit,
    cancelEdit,
    SPENDING_CATEGORIES,
  } = useAppContext();

  const isEditing = !!transactionToEdit;

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(SPENDING_CATEGORIES[0]);

  // Cập nhật form khi transactionToEdit thay đổi
  useEffect(() => {
    if (isEditing) {
      setText(transactionToEdit.text);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category || SPENDING_CATEGORIES[0]);
    } else {
      // Reset form khi không còn ở chế độ edit hoặc khi thêm mới
      setText("");
      setAmount("");
      setCategory(SPENDING_CATEGORIES[0]);
    }
  }, [transactionToEdit, isEditing, SPENDING_CATEGORIES]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === "" || amount.trim() === "") {
      alert("Vui lòng nhập đầy đủ nội dung và số tiền.");
      return;
    }

    const transactionData = {
      text,
      amount: +amount,
      category: +amount < 0 ? category : null,
    };

    if (isEditing) {
      handleUpdateTransaction(transactionToEdit.id, transactionData);
    } else {
      handleAddTransaction(transactionData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 max-w-lg mx-auto">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        {isEditing ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="text"
            className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold"
          >
            Nội dung
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="VD: Cà phê cuối tuần"
            className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold"
          >
            Số tiền{" "}
            <span className="font-normal text-sm text-slate-500">
              (âm - chi tiêu)
            </span>
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: -50000"
            className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
        {amount && +amount < 0 && (
          <div>
            <label
              htmlFor="category"
              className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold"
            >
              Hạng mục chi tiêu
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            >
              {SPENDING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-4">
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-300 text-lg"
            >
              Hủy
            </button>
          )}
          <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 text-lg">
            {isEditing ? "Cập nhật" : "Thêm giao dịch"}
          </button>
        </div>
      </form>
    </div>
  );
};
