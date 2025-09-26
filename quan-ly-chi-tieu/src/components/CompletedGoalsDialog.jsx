import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const CompletedGoalsDialog = ({ isOpen, onClose }) => {
  const { goals, formatCurrency } = useAppContext();

  const { completedGoals, totalCompletedAmount } = useMemo(() => {
    if (!goals) return { completedGoals: [], totalCompletedAmount: 0 };

    const filteredGoals = goals.filter(
      (g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0
    );

    const totalAmount = filteredGoals.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0
    );

    return { completedGoals: filteredGoals, totalCompletedAmount: totalAmount };
  }, [goals]);

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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-lg m-4 flex flex-col"
            style={{ maxHeight: "80vh" }}
            variants={modalVariants}
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
              Báo cáo Mục tiêu đã Hoàn thành
            </h3>
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Chúc mừng! Bạn đã hoàn thành {completedGoals.length} mục tiêu
                  với tổng giá trị là{" "}
                  <span className="font-bold">
                    {formatCurrency(totalCompletedAmount)}
                  </span>
                  .
                </p>
              </div>
              <ul className="space-y-3">
                {completedGoals.map((goal) => (
                  <li
                    key={goal.id}
                    className="flex justify-between items-center p-3 rounded-md bg-slate-50 dark:bg-slate-700/50"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {goal.name}
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </li>
                ))}
              </ul>
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
