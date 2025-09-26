import React from "react";
import { useAppContext } from "../context/AppContext";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { ConfirmDialog } from "./ConfirmDialog";
import { UndoToast } from "./UndoToast";
import { BudgetWarningToast } from "./BudgetWarningToast";
import { DeleteDataDialog } from "./DeleteDataDialog";
import { SetPinDialog } from "./SetPinDialog";
import { PinLockScreen } from "./PinLockScreen";

export const AppLayout = () => {
  const { theme, isAppLocked } = useAppContext();

  if (isAppLocked) return <PinLockScreen />;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans">
      <style>{`
                .react-datepicker-wrapper input { width: 100%; cursor: pointer; }
                .react-datepicker { font-family: inherit; border-color: #cbd5e1; }
                .react-datepicker__header { background-color: #f1f5f9; border-bottom-color: #cbd5e1; }
                .dark .react-datepicker { background-color: #1e293b; border-color: #475569; }
                .dark .react-datepicker__header { background-color: #334155; border-bottom-color: #475569; }
                .dark .react-datepicker__day-name, .dark .react-datepicker__day, .dark .react-datepicker__current-month { color: #e2e8f0; }
                .dark .react-datepicker__day:hover, .dark .react-datepicker__day--keyboard-selected { background-color: #475569; }
                .dark .react-datepicker__day--selected, .dark .react-datepicker__day--in-selecting-range, .dark .react-datepicker__day--in-range { background-color: #4f46e5; }
                .dark .react-datepicker__day--disabled { color: #64748b; }
            `}</style>
      <Sidebar
      // Không cần truyền props nữa
      />
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <MainContent
        // Không cần truyền props nữa
        />
      </main>
      <ConfirmDialog />
      <UndoToast />
      <BudgetWarningToast />
      <DeleteDataDialog />
      <SetPinDialog />
    </div>
  );
};
