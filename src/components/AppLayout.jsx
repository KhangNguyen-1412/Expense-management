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

import { LandingPageView } from "../views/LandingPageView";

export const AppLayout = () => {
  const { isAppLocked, activeView } = useAppContext();

  if (isAppLocked) return <PinLockScreen />;

  // Render standalone public Landing Page outside the app admin/dashboard layout
  if (activeView === "landing") {
    return (
      <div className="min-h-screen w-full bg-stone-100 dark:bg-stone-950 text-stone-800 dark:text-stone-100 overflow-y-auto font-sans transition-colors duration-300">
        <LandingPageView />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-100 dark:bg-stone-950 font-serif">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
        <MainContent />
      </main>
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
