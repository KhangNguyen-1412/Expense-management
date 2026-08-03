import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const EditGoalDialog = ({ isOpen, onClose, goal }) => {
  const { handleUpdateGoal } = useAppContext();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
    }
    if (!isOpen) {
      setError("");
    }
  }, [goal, isOpen]);

  if (!goal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || +targetAmount <= 0) {
      setError("Vui lòng nhập tên và số tiền mục tiêu hợp lệ.");
      return;
    }
    if (name === goal.name && +targetAmount === goal.targetAmount) {
      onClose(); // Không có gì thay đổi, chỉ cần đóng lại
      return;
    }
    handleUpdateGoal(goal.id, { name, targetAmount: +targetAmount });
    onClose();
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Chỉnh sửa mục tiêu
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-goal-name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tên mục tiêu
                </label>
                <input
                  id="edit-goal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="edit-goal-amount"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Số tiền cần đạt
                </label>
                <input
                  id="edit-goal-amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
