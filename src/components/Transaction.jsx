import React, { memo } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { TransactionIcon } from "./TransactionIcon";
import { useAppContext } from "../context/AppContext";

const TransactionComponent = ({
  transaction,
  isSelected,
  onToggleSelection,
  viewMode = "both", // 'table' | 'card' | 'both'
}) => {
  const isExpense = transaction.amount < 0;
  const sign = isExpense ? "-" : "+";
  const { handleDeleteTransaction, handleStartEdit, handleCopyTransaction } =
    useAppContext();

  const renderCard = () => (
    <div
      className={`p-4 my-2 rounded-2xl shadow-sm group relative transition-colors border ${
        isSelected
          ? "bg-emerald-100/60 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700"
          : "bg-stone-50 dark:bg-stone-900 border-stone-200/60 dark:border-stone-800"
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(transaction.id)}
          className="form-checkbox h-5 w-5 mt-1 text-emerald-800 border-stone-300 dark:border-stone-600 dark:bg-stone-900 rounded focus:ring-emerald-700"
        />
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
            {transaction.text}
          </p>
          <span
            className={`block font-serif font-bold text-lg mt-0.5 ${
              isExpense ? "text-rose-700 dark:text-rose-400" : "text-emerald-800 dark:text-emerald-400"
            }`}
          >
            {sign}
            {formatCurrency(Math.abs(transaction.amount))}
          </span>
          {transaction.createdAt && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 italic">
              {new Date(
                transaction.createdAt.seconds * 1000
              ).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleCopyTransaction(transaction)}
            className="p-1.5 text-stone-400 hover:text-emerald-700 transition-colors"
            aria-label="Sao chép"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleStartEdit(transaction)}
            className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            aria-label="Chỉnh sửa"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteTransaction(transaction.id)}
            className="p-1.5 text-stone-400 hover:text-rose-700 transition-colors"
            aria-label="Xóa"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTableRow = () => (
    <tr
      className={`border-b border-stone-200/60 dark:border-stone-700/50 group transition-colors ${
        isSelected
          ? "bg-emerald-100/50 dark:bg-emerald-950/40"
          : "hover:bg-stone-100/40 dark:hover:bg-stone-800/40"
      }`}
    >
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(transaction.id)}
          className="form-checkbox h-4 w-4 text-emerald-800 border-stone-300 dark:border-stone-600 dark:bg-stone-900 rounded focus:ring-emerald-700"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center">
          {isExpense && <TransactionIcon category={transaction.category} />}
          <div className="ml-3">
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              {transaction.text}
            </p>
            {transaction.createdAt && (
              <p className="text-xs text-stone-400 dark:text-stone-500 italic">
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
          className={`font-serif font-bold text-base ${
            isExpense ? "text-rose-700 dark:text-rose-400" : "text-emerald-800 dark:text-emerald-400"
          }`}
        >
          {sign}
          {formatCurrency(Math.abs(transaction.amount))}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleCopyTransaction(transaction)}
            className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 p-1.5 rounded-lg hover:bg-emerald-800 hover:text-white transition-colors"
            aria-label="Sao chép"
            title="Sao chép"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleStartEdit(transaction)}
            className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 hover:text-white transition-colors"
            aria-label="Chỉnh sửa"
            title="Chỉnh sửa"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteTransaction(transaction.id)}
            className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 p-1.5 rounded-lg hover:bg-rose-700 hover:text-white transition-colors"
            aria-label="Xóa"
            title="Xóa"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );

  if (viewMode === "card") return renderCard();
  if (viewMode === "table") return renderTableRow();

  return (
    <>
      <div className="sm:hidden">{renderCard()}</div>
      <tr className="hidden sm:table-row">{renderTableRow()}</tr>
    </>
  );
};

export const Transaction = memo(TransactionComponent);
