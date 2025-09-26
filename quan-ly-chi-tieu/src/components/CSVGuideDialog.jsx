import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CSVGuideDialog = ({ isOpen, onClose }) => {
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
              Hướng dẫn định dạng file CSV
            </h3>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Để nhập dữ liệu thành công, file CSV của bạn cần tuân thủ định
              dạng sau:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li>File phải có dòng tiêu đề (header).</li>
              <li>
                Các cột bắt buộc: <strong>Nội dung</strong>,{" "}
                <strong>Số tiền</strong>.
              </li>
              <li>
                Cột tùy chọn: <strong>Hạng mục</strong>.
              </li>
              <li>Số tiền chi tiêu phải là số âm (ví dụ: -50000).</li>
            </ul>

            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
              Ví dụ:
            </p>
            <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">
              <code>
                {`Nội dung,Số tiền,Hạng mục
"Cà phê cuối tuần",-50000,"Ăn uống"
"Lương tháng 5",10000000,
"Đóng tiền điện",-500000,"Hóa đơn"`}
              </code>
            </pre>

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
