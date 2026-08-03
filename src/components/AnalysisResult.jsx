import React, { memo } from "react";

const AnalysisResultComponent = ({ analysis, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-center">
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-blue-700 dark:text-blue-400 font-medium">
            Chuyên gia AI đang phân tích...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-lg">
        <h4 className="font-bold text-red-800 dark:text-red-400">
          Đã xảy ra lỗi
        </h4>
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }
  if (!analysis) return null;
  return (
    <div className="mt-6 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
        💡 Phân tích từ Chuyên gia AI
      </h3>
      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: analysis }}
      ></div>
    </div>
  );
};

export const AnalysisResult = memo(AnalysisResultComponent);
