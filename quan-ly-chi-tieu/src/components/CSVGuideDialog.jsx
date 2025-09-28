import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Dialog.css";

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
        <motion.div className="dialog-backdrop">
          {/* Backdrop */}
          <motion.div
            className="dialog-overlay"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* Dialog box */}
          <motion.div
            className="dialog-box"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <h3 className="dialog-title">Hướng dẫn định dạng file CSV</h3>
            <p className="dialog-content">
              Để nhập dữ liệu thành công, file CSV của bạn cần tuân thủ định
              dạng sau:
            </p>
            <ul className="dialog-list">
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

            <p className="dialog-subtitle">Ví dụ:</p>
            <pre className="dialog-code-block">
              <code>
                {`Nội dung,Số tiền,Hạng mục
"Cà phê cuối tuần",-50000,"Ăn uống"
"Lương tháng 5",10000000,
"Đóng tiền điện",-500000,"Hóa đơn"`}
              </code>
            </pre>

            <div className="dialog-actions">
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Đã hiểu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
