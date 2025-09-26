import {
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Custom hook để quản lý các thao tác với giao dịch trên Firestore.
 * @param {object} user - Đối tượng người dùng từ Firebase Auth.
 */
export const useTransactions = (user) => {
  const addTransaction = async (transactionData) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      ...transactionData,
      createdAt: serverTimestamp(),
    });
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
  };

  const updateTransaction = async (id, updatedData) => {
    if (!user) return;
    const transactionDoc = doc(db, `users/${user.uid}/transactions`, id);
    await updateDoc(transactionDoc, updatedData);
  };

  const addMultipleTransactions = async (transactions) => {
    if (!user || transactions.length === 0) return;

    const batch = writeBatch(db);
    const transColRef = collection(db, `users/${user.uid}/transactions`);

    transactions.forEach((transaction) => {
      const newDocRef = doc(transColRef); // Tạo một tham chiếu document mới
      batch.set(newDocRef, { ...transaction, createdAt: serverTimestamp() });
    });

    await batch.commit();
  };

  return {
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addMultipleTransactions,
  };
};
