import { useMemo } from "react";

export const useTransactionCalculations = (transactions) => {
  const { income, expense, total } = useMemo(() => {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, total: income + expense };
  }, [transactions]);

  return { income, expense, total };
};
