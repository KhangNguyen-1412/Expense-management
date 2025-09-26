import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const MergeTransactionsDialog = ({
  isOpen,
  onClose,
  selectedTransactions,
}) => {
  const { handleMergeTransactions, formatCurrency } = useAppContext();
  const [newName, setNewName] = useState("");

  const { totalAmount, newCategory } = useMemo(() => {
    if (!selectedTransactions || selectedTransactions.length === 0) {
      return { totalAmount: 0, newCategory: null };
    }
    const total = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);
    // Use the category of the first expense, or null if all are income
    const firstExpense = selectedTransactions.find((t) => t.amount < 0);
    return {
      totalAmount: total,
      newCategory: firstExpense ? firstExpense.category : null,
    };
  }, [selectedTransactions]);

  const handleConfirmMerge = async () => {
    if (newName.trim() === "") {
      alert("Vui lòng nhập tên cho giao dịch mới.");
      return;
    }
    const idsToMerge = selectedTransactions.map((t) => t.id);
    const newTransactionData = {
      text: newName,
      amount: totalAmount,
      category: totalAmount < 0 ? newCategory : null,
    };
    await handleMergeTransactions(idsToMerge, newTransactionData);
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 30, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60"
            variants={backdropVariants}
            onClick={onClose}
          ></motion.div>
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Gộp {selectedTransactions.length} giao dịch
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Tổng số tiền:{" "}
              <span className="font-bold">{formatCurrency(totalAmount)}</span>
            </p>
            <div className="mt-4">
              <label
                htmlFor="new-name"
                className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold"
              >
                Tên giao dịch mới
              </label>
              <input
                type="text"
                id="new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Chi tiêu ăn uống tuần 1"
                className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmMerge}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Xác nhận gộp
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
