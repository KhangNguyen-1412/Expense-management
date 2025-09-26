import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";

export const UndoToast = () => {
  const { lastUndoableAction, setLastUndoableAction } = useAppContext();

  useEffect(() => {
    if (lastUndoableAction) {
      const timer = setTimeout(() => {
        setLastUndoableAction(null);
      }, 7000); // Disappears after 7 seconds

      return () => clearTimeout(timer);
    }
  }, [lastUndoableAction, setLastUndoableAction]);

  const handleUndo = () => {
    if (lastUndoableAction && lastUndoableAction.onUndo) {
      lastUndoableAction.onUndo();
    }
    setLastUndoableAction(null); // Hide toast immediately after clicking undo
  };

  return (
    <AnimatePresence>
      {lastUndoableAction && (
        <motion.div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between gap-4 bg-slate-800 text-white rounded-lg shadow-lg px-4 py-3">
            <span>{lastUndoableAction.message}</span>
            <button
              onClick={handleUndo}
              className="font-bold uppercase text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Hoàn tác
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
