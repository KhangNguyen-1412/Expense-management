import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useFirestoreData = (user, date) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!user || !date) {
      setTransactions([]);
      setBudgets({});
      setGoals([]);
      setIsLoadingData(false);
      return;
    }

    const transColRef = collection(db, `users/${user.uid}/transactions`);
    const transQuery = query(transColRef, orderBy("createdAt", "desc"));
    const unsubscribeTrans = onSnapshot(transQuery, (snapshot) => {
      setTransactions(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setIsLoadingData(false);
    });

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const budgetDocId = `${year}-${month}`;
    const budgetDocRef = doc(db, `users/${user.uid}/budgets`, budgetDocId);
    const unsubscribeBudgets = onSnapshot(budgetDocRef, (docSnapshot) => {
      setBudgets(docSnapshot.exists() ? docSnapshot.data() : {});
    });

    const goalsColRef = collection(db, `users/${user.uid}/goals`);
    const goalsQuery = query(goalsColRef, orderBy("createdAt", "desc"));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      // We can keep isLoadingData tied to transactions load
    });

    return () => {
      unsubscribeTrans();
      unsubscribeBudgets();
      unsubscribeGoals();
    };
  }, [user, date]);

  return { transactions, budgets, goals, isLoadingData };
};
