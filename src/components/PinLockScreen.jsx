import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const PinLockScreen = () => {
  const { unlockApp } = useAppContext();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const PIN_LENGTH = 4;

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const isCorrect = unlockApp(pin);
      if (!isCorrect) {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 800);
      }
    }
  }, [pin, unlockApp]);

  const handleKeyClick = useCallback(
    (key) => {
      if (String(key).match(/^[0-9]$/)) {
        setPin((prevPin) =>
          prevPin.length < PIN_LENGTH ? prevPin + key : prevPin
        );
      }
    },
    [PIN_LENGTH]
  );

  const handleDelete = useCallback(() => {
    setPin((prevPin) => prevPin.slice(0, -1));
  }, []);

  // Lắng nghe sự kiện bàn phím để nhập PIN
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key >= "0" && event.key <= "9") {
        handleKeyClick(event.key);
      } else if (event.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyClick, handleDelete]);

  const PinDot = ({ filled }) => (
    <div
      className={`w-4 h-4 rounded-full transition-colors ${
        filled ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
      }`}
    ></div>
  );

  const Key = ({ value, onClick, isDelete = false }) => (
    <button
      onClick={onClick}
      className="w-20 h-20 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-3xl font-light text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors hover:bg-slate-300/70 dark:hover:bg-slate-700/70"
    >
      {isDelete ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
          />
        </svg>
      ) : (
        value
      )}
    </button>
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Nhập mã PIN
      </h2>
      <motion.div
        className="flex items-center gap-4 mb-8"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {Array(PIN_LENGTH)
          .fill(0)
          .map((_, i) => (
            <PinDot key={i} filled={i < pin.length} />
          ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Key key={num} value={num} onClick={() => handleKeyClick(num)} />
        ))}
        <div /> {/* Empty space */}
        <Key value={0} onClick={() => handleKeyClick(0)} />
        <Key isDelete onClick={handleDelete} />
      </div>
    </motion.div>
  );
};
