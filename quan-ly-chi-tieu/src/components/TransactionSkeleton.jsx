import React from "react";

export const TransactionSkeleton = () => {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className="sm:hidden p-4 my-2 rounded-xl shadow-sm bg-white dark:bg-slate-800 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mt-1"></div>
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>

      {/* Desktop Skeleton */}
      <tr className="hidden sm:table-row border-b border-slate-200 dark:border-slate-700 animate-pulse">
        <td className="p-3 text-center">
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
        </td>
        <td className="p-3">
          <div className="flex items-center">
            <div className="w-6 h-6 mr-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="flex-1 space-y-2 ml-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </td>
        <td className="p-3 text-right">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto"></div>
        </td>
        <td className="p-3 text-center">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto"></div>
        </td>
      </tr>
    </>
  );
};
