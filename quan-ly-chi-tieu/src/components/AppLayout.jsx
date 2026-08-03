import React from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/common.css";
import "../styles/datepicker-custom.css";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MainContent } from "./MainContent";
import { ConfirmDialog } from "./ConfirmDialog";
import { UndoToast } from "./UndoToast";
import { BudgetWarningToast } from "./BudgetWarningToast";
import { DeleteDataDialog } from "./DeleteDataDialog";
import { SetPinDialog } from "./SetPinDialog";
import { PinLockScreen } from "./PinLockScreen";

export const AppLayout = () => {
  const { isAppLocked } = useAppContext();

  if (isAppLocked) return <PinLockScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
        <MainContent />
      </main>
      <BottomNav />
      <ConfirmDialog />
      <UndoToast />
      <BudgetWarningToast />
      <DeleteDataDialog />
      <SetPinDialog />
    </div>
  );
};
