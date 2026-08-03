import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Dialog.css";

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
            <h3 className="dialog-title">Hướng dẫn Ghi âm Giao dịch</h3>
            <p className="dialog-content">
              Sử dụng giọng nói để thêm giao dịch nhanh chóng. Bấm vào nút micro
              để bắt đầu và kết thúc.
            </p>

            <h4 className="dialog-subtitle">Cấu trúc câu lệnh:</h4>
            <p className="dialog-sub-content">
              Bạn có thể đọc một câu đầy đủ hoặc đọc từng phần.
            </p>
            <pre className="dialog-code-block">
              <code>
                {`[Loại] [Tên] với số tiền là [Số tiền] với danh mục là [Tên danh mục]`}
              </code>
            </pre>

            <h4 className="dialog-subtitle">Các từ khóa quan trọng:</h4>
            <ul className="dialog-list">
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
