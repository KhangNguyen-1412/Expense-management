import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Custom hook để quản lý các thao tác với mục tiêu tiết kiệm trên Firestore.
 * @param {object} user - Đối tượng người dùng từ Firebase Auth.
 */
export const useGoals = (user) => {
  const goalsColRef = user ? collection(db, `users/${user.uid}/goals`) : null;

  const addGoal = async (goalData) => {
    if (!goalsColRef) return;
    await addDoc(goalsColRef, {
      ...goalData,
      currentAmount: 0,
      createdAt: serverTimestamp(),
    });
  };

  const deleteGoal = async (id) => {
    if (!user) return;
    const goalDoc = doc(db, `users/${user.uid}/goals`, id);
    await deleteDoc(goalDoc);
  };

  const contributeToGoal = async (id, amount) => {
    if (!user || amount <= 0) return;
    const goalDoc = doc(db, `users/${user.uid}/goals`, id);
    await updateDoc(goalDoc, { currentAmount: increment(amount) });
  };

  return { addGoal, deleteGoal, contributeToGoal };
};
