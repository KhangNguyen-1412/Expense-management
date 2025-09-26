import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const BudgetWarningToast = () => {
  const { budgetWarnings, setBudgetWarnings } = useAppContext();

  const handleDismiss = (idToDismiss) => {
    setBudgetWarnings((currentWarnings) =>
      currentWarnings.filter((w) => w.id !== idToDismiss)
    );
  };

  if (budgetWarnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {budgetWarnings.map((warning) => {
          const isExceeded = warning.type === "exceeded";
          return (
            <motion.div
              key={warning.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex items-start justify-between gap-4 rounded-lg shadow-lg p-4 w-full max-w-sm ${
                isExceeded
                  ? "bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500"
                  : "bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-500"
              }`}
            >
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${
                    isExceeded
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-grow">
                <p
                  className={`font-semibold ${
                    isExceeded
                      ? "text-red-800 dark:text-red-200"
                      : "text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {warning.message}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(warning.id)}
                className={`p-1 rounded-full ${
                  isExceeded
                    ? "text-red-500 hover:bg-red-200 dark:hover:bg-red-800"
                    : "text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-800"
                }`}
                aria-label="Đóng"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
