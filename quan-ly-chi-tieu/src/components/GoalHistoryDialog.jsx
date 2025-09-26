import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const GoalHistoryDialog = ({ isOpen, onClose, goal }) => {
  const { transactions, formatCurrency } = useAppContext();

  const goalTransactions = useMemo(() => {
    if (!goal || !transactions) return [];
    // Lọc các giao dịch có nội dung khớp với mẫu gửi tiền vào mục tiêu
    return transactions
      .filter((t) => t.text === `Gửi tiền vào mục tiêu: ${goal.name}`)
      .sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      ); // Sắp xếp mới nhất lên đầu
  }, [transactions, goal]);

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  if (!goal) return null;

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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md m-4 flex flex-col"
            style={{ maxHeight: "80vh" }}
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              Lịch sử gửi tiền: {goal.name}
            </h3>
            <div className="flex-grow overflow-y-auto pr-2">
              {goalTransactions.length > 0 ? (
                <ul className="space-y-3">
                  {goalTransactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between items-center p-2 rounded-md bg-slate-50 dark:bg-slate-700/50"
                    >
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(
                          t.createdAt?.seconds * 1000
                        ).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(Math.abs(t.amount))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Chưa có lịch sử gửi tiền cho mục tiêu này.
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
