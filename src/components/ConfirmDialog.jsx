import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const ConfirmDialog = () => {
  const { isSignOutConfirmOpen, confirmSignOut, cancelSignOut } =
    useAppContext();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isSignOutConfirmOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60"
            variants={backdropVariants}
            onClick={cancelSignOut}
          ></motion.div>

          {/* Dialog box */}
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Xác nhận Đăng xuất
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Bạn có chắc chắn muốn đăng xuất không?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelSignOut}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-colors font-semibold"
              >
                Đăng xuất
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
