import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const SetPinDialog = () => {
  const { isSetPinOpen, closeSetPinDialog, enablePinLock } = useAppContext();
  const [step, setStep] = useState(1); // 1: Enter new PIN, 2: Confirm new PIN
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset state when dialog opens
    if (isSetPinOpen) {
      setStep(1);
      setNewPin("");
      setConfirmPin("");
      setError("");
    }
  }, [isSetPinOpen]);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 4) return;

    if (step === 1) setNewPin(val);
    else setConfirmPin(val);
  };

  const handleNext = () => {
    if (newPin.length !== 4) {
      setError("Mã PIN phải có 4 chữ số.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConfirm = () => {
    if (newPin !== confirmPin) {
      setError("Mã PIN xác nhận không khớp. Vui lòng thử lại.");
      setStep(1);
      setNewPin("");
      setConfirmPin("");
      return;
    }
    enablePinLock(newPin);
    closeSetPinDialog();
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isSetPinOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60"
            variants={backdropVariants}
            onClick={closeSetPinDialog}
          ></motion.div>
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm m-4"
            variants={modalVariants}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {step === 1 ? "Thiết lập mã PIN" : "Xác nhận mã PIN"}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {step === 1
                ? "Nhập mã PIN mới gồm 4 chữ số."
                : "Nhập lại mã PIN để xác nhận."}
            </p>
            <div className="mt-4">
              <input
                type="password"
                maxLength="4"
                value={step === 1 ? newPin : confirmPin}
                onChange={handlePinChange}
                className="w-full p-3 text-center text-2xl tracking-[1em] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeSetPinDialog}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold"
              >
                Hủy
              </button>
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                >
                  Xác nhận
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
