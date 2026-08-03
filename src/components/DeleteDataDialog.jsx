import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const DeleteDataDialog = () => {
  const {
    isDeleteDataConfirmOpen,
    closeDeleteDataDialog,
    handleDeleteAllData,
  } = useAppContext();
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_STRING = "XÓA";

  const handleConfirm = () => {
    if (confirmText === CONFIRM_STRING) {
      handleDeleteAllData();
      closeDeleteDataDialog();
    } else {
      alert(`Vui lòng nhập đúng "${CONFIRM_STRING}" để xác nhận.`);
    }
  };

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
      {isDeleteDataConfirmOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60"
            variants={backdropVariants}
            onClick={closeDeleteDataDialog}
          ></motion.div>
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
              Hành động nguy hiểm!
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa toàn bộ dữ liệu không? Hành động này
              không thể hoàn tác. Để xác nhận, vui lòng nhập chữ{" "}
              <strong>{CONFIRM_STRING}</strong> vào ô bên dưới.
            </p>
            <div className="mt-4">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeDeleteDataDialog}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmText !== CONFIRM_STRING}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận xóa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
