import {
  addDoc,
  updateDoc,
  writeBatch,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { deleteDoc } from "firebase/firestore";

/**
 * Custom hook để quản lý các thao tác với giao dịch trên Firestore.
 * @param {object} user - Đối tượng người dùng từ Firebase Auth.
 */
export const useTransactions = (user) => {
  const transColRef = user
    ? collection(db, `users/${user.uid}/transactions`)
    : null;

  const addTransaction = async (transactionData) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      ...transactionData,
      createdAt: serverTimestamp(),
    });
  };

  const updateTransaction = async (id, updatedData) => {
    if (!user) return;
    const transactionDoc = doc(db, `users/${user.uid}/transactions`, id);
    await updateDoc(transactionDoc, updatedData);
  };

  const addMultipleTransactions = async (transactions) => {
    if (!user || !transactions || transactions.length === 0) return 0;

    const batch = writeBatch(db);

    transactions.forEach((transaction) => {
      const newDocRef = doc(transColRef); // Tạo một tham chiếu document mới
      batch.set(newDocRef, { ...transaction, createdAt: serverTimestamp() });
    });
    await batch.commit();
    return transactions.length;
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
  };

  const mergeTransactions = async (idsToMerge, newTransactionData) => {
    if (!user || !transColRef || idsToMerge.length < 2) return null;
    const batch = writeBatch(db);
    idsToMerge.forEach((id) => {
      const docRef = doc(db, `users/${user.uid}/transactions`, id);
      batch.delete(docRef);
    });
    const newDocRef = doc(transColRef);
    batch.set(newDocRef, {
      ...newTransactionData,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
    return newDocRef.id;
  };

  const revertMerge = async (newTransactionId, originalTransactions) => {
    if (!user || !transColRef) return;
    const batch = writeBatch(db);
    const newDocRef = doc(
      db,
      `users/${user.uid}/transactions`,
      newTransactionId
    );
    batch.delete(newDocRef);
    originalTransactions.forEach((t) => {
      const reAddRef = doc(transColRef);
      batch.set(reAddRef, { ...t, createdAt: serverTimestamp() });
    });
    await batch.commit();
  };

  const deleteAllUserData = async () => {
    if (!user) return;
    // Đây là một hành động nguy hiểm và nên được xử lý cẩn thận,
    // tốt nhất là trong một Cloud Function với các quy tắc bảo mật phù hợp.
    console.warn(
      `Yêu cầu xóa tất cả dữ liệu cho người dùng ${user.uid}. Chức năng này cần được triển khai ở backend an toàn.`
    );
  };

  return {
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addMultipleTransactions,
    mergeTransactions,
    revertMerge,
    deleteAllUserData,
  };
};
