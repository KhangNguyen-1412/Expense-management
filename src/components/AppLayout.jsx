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
import { QuickAddFAB } from "./QuickAddFAB";
import { MobileHeader } from "./MobileHeader";

import { LandingPageView } from "../views/LandingPageView";

export const AppLayout = () => {
  const { isAppLocked, activeView } = useAppContext();

  if (isAppLocked) return <PinLockScreen />;

  // Render standalone public Landing Page outside the app admin/dashboard layout
  if (activeView === "landing") {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto font-sans transition-colors duration-300">
        <LandingPageView />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MobileHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
          <MainContent />
        </main>
      </div>
      <BottomNav />
      <QuickAddFAB />
      <ConfirmDialog />
      <UndoToast />
      <BudgetWarningToast />
      <DeleteDataDialog />
      <SetPinDialog />
    </div>
  );
};
