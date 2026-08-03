import React, { memo } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { TransactionIcon } from "./TransactionIcon";
import { useAppContext } from "../context/AppContext";

const TransactionComponent = ({
  transaction,
  isSelected,
  onToggleSelection,
}) => {
  const isExpense = transaction.amount < 0;
  const sign = isExpense ? "-" : "+";
  const { handleDeleteTransaction, handleStartEdit, handleCopyTransaction } =
    useAppContext();

  return (
    <>
      {/* Mobile View: Card Layout */}
      <div
        className={`sm:hidden p-4 my-2 rounded-xl shadow-sm group relative transition-colors ${
          isSelected
            ? "bg-indigo-50 dark:bg-indigo-900/30"
            : "bg-white dark:bg-slate-800"
        }`}
      >
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(transaction.id)}
            className="form-checkbox h-5 w-5 mt-1 text-indigo-600 border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded focus:ring-indigo-500"
          />
          <div className="flex-grow">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {transaction.text}
            </p>
            <span
              className={`block font-bold text-lg mt-1 ${
                isExpense ? "text-red-500" : "text-green-500"
              }`}
            >
              {sign}
              {formatCurrency(Math.abs(transaction.amount))}
            </span>
            {transaction.createdAt && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {new Date(
                  transaction.createdAt.seconds * 1000
                ).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => handleCopyTransaction(transaction)}
              className="text-slate-400 hover:text-green-500"
              aria-label="Sao chép"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleStartEdit(transaction)}
              className="text-slate-400 hover:text-blue-500"
              aria-label="Chỉnh sửa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="text-slate-400 hover:text-red-500"
              aria-label="Xóa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View: Table Row */}
      <tr
        className={`hidden sm:table-row border-b border-slate-200 dark:border-slate-700 group transition-colors ${
          isSelected
            ? "bg-indigo-50 dark:bg-indigo-900/30"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
      >
        <td className="p-3 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(transaction.id)}
            className="form-checkbox h-5 w-5 text-indigo-600 border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded focus:ring-indigo-500"
          />
        </td>
        <td className="p-3">
          <div className="flex items-center">
            {isExpense && <TransactionIcon category={transaction.category} />}
            <div className="ml-3">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {transaction.text}
              </p>
              {transaction.createdAt && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(
                    transaction.createdAt.seconds * 1000
                  ).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="p-3 text-right">
          <span
            className={`font-bold text-lg ${
              isExpense ? "text-red-500" : "text-green-500"
            }`}
          >
            {sign}
            {formatCurrency(Math.abs(transaction.amount))}
          </span>
        </td>
        <td className="p-3">
          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => handleCopyTransaction(transaction)}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
              aria-label="Sao chép"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleStartEdit(transaction)}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              aria-label="Chỉnh sửa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              aria-label="Xóa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </>
  );
};

export const Transaction = memo(TransactionComponent);
