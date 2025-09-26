import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const VoiceGuideDialog = ({ isOpen, onClose }) => {
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60"
            variants={backdropVariants}
            onClick={onClose}
          ></motion.div>

          {/* Dialog box */}
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-lg m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Hướng dẫn Ghi âm Giao dịch
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Sử dụng giọng nói để thêm giao dịch nhanh chóng. Bấm vào nút micro
              để bắt đầu và kết thúc.
            </p>

            <h4 className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
              Cấu trúc câu lệnh:
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bạn có thể đọc một câu đầy đủ hoặc đọc từng phần.
            </p>
            <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">
              <code>
                {`[Loại] [Tên] với số tiền là [Số tiền] với danh mục là [Tên danh mục]`}
              </code>
            </pre>

            <h4 className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
              Các từ khóa quan trọng:
            </h4>
            <ul className="mt-2 list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Loại giao dịch:</strong> Dùng "thu nhập" hoặc "khoản
                thu". Nếu bỏ qua, mặc định là chi tiêu.
              </li>
              <li>
                <strong>Xác nhận:</strong> Nói "OK" để thêm giao dịch.
              </li>
              <li>
                <strong>Hủy bỏ:</strong> Nói "Hủy" để xóa thông tin vừa đọc.
              </li>
            </ul>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
