import React, { useState, useEffect } from "react";
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
  } = useAppContext();

  const isEditing = !!transactionToEdit;

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(SPENDING_CATEGORIES[0]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
    <div className="add-transaction-container">
      <VoiceGuideDialog
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <div className="add-transaction-header">
        <h3 className="add-transaction-title">
          {isEditing ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsGuideOpen(true)}
            className="voice-guide-button"
          >
            Xem hướng dẫn ghi âm
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="text" className="form-label">
            Nội dung
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="VD: Cà phê cuối tuần"
            className="form-input" // Class này giờ đến từ common.css
          />
        </div>
        <div>
          <label htmlFor="amount" className="form-label">
            Số tiền <span className="amount-note">(âm - chi tiêu)</span>
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: -50000"
            className="form-input" // Class này giờ đến từ common.css
          />
        </div>
        {amount && +amount < 0 && (
          <div>
            <label htmlFor="category" className="form-label">
              Hạng mục chi tiêu
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input" // Có thể dùng chung form-input
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
              className="btn btn-secondary w-full"
            >
              Hủy
            </button>
          )}
          <button className="btn btn-primary w-full">
            {isEditing ? "Cập nhật" : "Thêm giao dịch"}
          </button>
        </div>
      </form>
    </div>
  );
};
