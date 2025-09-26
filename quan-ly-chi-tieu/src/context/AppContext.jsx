import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleSignOut as firebaseSignOut } from "../config/firebase";
import { formatCurrency } from "../utils/formatCurrency";
import { SPENDING_CATEGORIES } from "../constants/categories";

// Custom Hooks
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useFirestoreData } from "../hooks/useFirestoreData";
import { useTransactionCalculations } from "../hooks/useTransactionCalculations";
import { useTransactions } from "../hooks/useTransactions";
import { useGeminiAnalysis } from "../hooks/useGeminiAnalysis";
import { usePushNotifications } from "../hooks/usePushNotifications";

// 1. Tạo Context
const AppContext = createContext();

// 2. Tạo Provider Component
export const AppProvider = ({ children }) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [lastUndoableAction, setLastUndoableAction] = useState(null);
  const [budgetWarnings, setBudgetWarnings] = useState([]);
  const [isDeleteDataConfirmOpen, setIsDeleteDataConfirmOpen] = useState(false);
  const [selectedBudgetDate, setSelectedBudgetDate] = useState(new Date());

  // Sử dụng các custom hook để quản lý state và logic
  const { theme, toggleTheme } = useTheme();
  const { user, authError, isLoadingAuth } = useAuth();
  const { transactions, budgets, isLoadingData } = useFirestoreData(
    user,
    selectedBudgetDate
  );
  const { income, expense, total } = useTransactionCalculations(transactions);
  const {
    analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
    handleAnalyzeSpending,
  } = useGeminiAnalysis(transactions);
  const {
    addTransaction,
    deleteTransaction,
    updateTransaction,
    mergeTransactions,
    addMultipleTransactions,
    revertMerge,
    deleteAllUserData,
  } = useTransactions(user);
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushNotifications(user);

  // Memo để tính toán chi tiêu cho từng hạng mục trong tháng hiện tại
  const selectedMonthCategorySpending = useMemo(() => {
    const selectedDate = selectedBudgetDate || new Date();
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );

    return transactions
      .filter((t) => {
        if (t.amount >= 0 || !t.createdAt?.seconds) return false;
        const transDate = new Date(t.createdAt.seconds * 1000);
        return transDate >= startOfMonth && transDate <= endOfMonth;
      })
      .reduce((acc, t) => {
        const category = t.category || "Khác";
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});
  }, [transactions]);

  // Effect để kiểm tra và tạo cảnh báo ngân sách
  useEffect(() => {
    if (!budgets || Object.keys(budgets).length === 0) {
      setBudgetWarnings([]);
      return;
    }

    const warnings = [];
    const WARNING_THRESHOLD = 0.9; // 90%
    const EXCEEDED_THRESHOLD = 1.0; // 100%

    Object.entries(budgets).forEach(([category, budgetAmount]) => {
      if (budgetAmount <= 0) return;

      const spentAmount = selectedMonthCategorySpending[category] || 0;
      const percentage = spentAmount / budgetAmount;

      if (percentage >= EXCEEDED_THRESHOLD) {
        warnings.push({
          id: category,
          type: "exceeded",
          message: `Bạn đã VƯỢT ngân sách cho hạng mục "${category}".`,
        });
      } else if (percentage >= WARNING_THRESHOLD) {
        warnings.push({
          id: category,
          type: "warning",
          message: `Bạn sắp hết ngân sách cho hạng mục "${category}".`,
        });
      }
    });

    setBudgetWarnings(warnings);
  }, [selectedMonthCategorySpending, budgets]);

  // Các hàm xử lý sự kiện (event handlers)
  const handleAddTransaction = useCallback(
    async (transactionData) => {
      await addTransaction(transactionData);
      setActiveView("history");
    },
    [addTransaction]
  );

  const handleDeleteTransaction = useCallback(
    async (id) => {
      const transactionToDelete = transactions.find((t) => t.id === id);
      if (!transactionToDelete) return;

      await deleteTransaction(id);

      // Set up the undo action
      const onUndo = async () => {
        // Re-add the transaction without its id and createdAt,
        // Firestore will generate new ones.
        const { id: deletedId, createdAt, ...reAddData } = transactionToDelete;
        await addTransaction(reAddData);
      };

      setLastUndoableAction({
        message: `Đã xóa "${transactionToDelete.text}".`,
        onUndo: onUndo,
      });
    },
    [transactions, deleteTransaction, addTransaction]
  );

  const handleSetBudgets = useCallback(
    async (newBudgets) => {
      if (!user || !selectedBudgetDate) return;
      const year = selectedBudgetDate.getFullYear();
      const month = String(selectedBudgetDate.getMonth() + 1).padStart(2, "0");
      const budgetDocId = `${year}-${month}`;
      await setDoc(
        doc(db, `users/${user.uid}/budgets`, budgetDocId),
        newBudgets
      );
      alert("Đã lưu ngân sách thành công!");
    },
    [user, selectedBudgetDate]
  );

  const handleStartEdit = useCallback((transaction) => {
    setTransactionToEdit(transaction);
    setActiveView("add");
  }, []);

  const handleUpdateTransaction = useCallback(
    async (id, updatedData) => {
      await updateTransaction(id, updatedData);
      setTransactionToEdit(null);
      setActiveView("history");
    },
    [updateTransaction]
  );

  const cancelEdit = useCallback(() => {
    setTransactionToEdit(null);
    // Quay lại màn hình trước đó, hoặc mặc định là history
    setActiveView("history");
  }, []);

  const handleCopyTransaction = useCallback(
    async (transactionToCopy) => {
      const { text, amount, category } = transactionToCopy;
      const newTransactionData = { text, amount, category };
      await addTransaction(newTransactionData);
      // Tự động chuyển đến màn hình lịch sử để người dùng thấy giao dịch vừa được sao chép
      setActiveView("history");
    },
    [addTransaction]
  );

  const handleMergeTransactions = useCallback(
    async (idsToMerge, newTransactionData) => {
      const originalTransactions = transactions.filter((t) =>
        idsToMerge.includes(t.id)
      );

      const newTransactionId = await mergeTransactions(
        idsToMerge,
        newTransactionData
      );

      if (newTransactionId) {
        const onUndo = async () => {
          const transactionsToRecreate = originalTransactions.map(
            ({ id, createdAt, ...data }) => data
          );
          await revertMerge(newTransactionId, transactionsToRecreate);
        };
        setLastUndoableAction({
          message: `Đã gộp ${idsToMerge.length} giao dịch.`,
          onUndo: onUndo,
        });
      }
    },
    [transactions, mergeTransactions, revertMerge]
  );

  const handleDeleteAllData = useCallback(() => {
    deleteAllUserData();
    // Optionally, sign out the user after deleting data
    // firebaseSignOut();
  }, [deleteAllUserData]);

  const openDeleteDataDialog = () => setIsDeleteDataConfirmOpen(true);
  const closeDeleteDataDialog = () => setIsDeleteDataConfirmOpen(false);

  const handleSignOut = useCallback(() => {
    setIsSignOutConfirmOpen(true);
  }, []);

  const confirmSignOut = useCallback(() => {
    firebaseSignOut();
    setIsSignOutConfirmOpen(false);
  }, []);

  const cancelSignOut = useCallback(() => {
    setIsSignOutConfirmOpen(false);
  }, []);

  // 3. Tạo object `value` để cung cấp cho các component con
  const value = {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    user,
    authError,
    isLoadingAuth,
    transactions,
    budgets,
    isLoadingData,
    income,
    expense,
    total,
    analysis,
    isLoadingAnalysis,
    analysisError,
    handleAnalyzeSpending,
    handleAddTransaction,
    handleDeleteTransaction,
    handleSetBudgets,
    handleSignOut,
    isSignOutConfirmOpen,
    transactionToEdit,
    handleStartEdit,
    handleUpdateTransaction,
    handleMergeTransactions,
    handleCopyTransaction,
    addMultipleTransactions,
    cancelEdit,
    confirmSignOut,
    cancelSignOut,
    lastUndoableAction,
    setLastUndoableAction,
    budgetWarnings,
    setBudgetWarnings,
    selectedBudgetDate,
    setSelectedBudgetDate,
    selectedMonthCategorySpending,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    handleDeleteAllData,
    isDeleteDataConfirmOpen,
    openDeleteDataDialog,
    closeDeleteDataDialog,
    SPENDING_CATEGORIES,
    formatCurrency,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 4. Tạo custom hook để sử dụng Context dễ dàng hơn
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
