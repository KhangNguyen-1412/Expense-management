import React, { memo } from "react";

const TransactionIconComponent = ({ category }) => {
  const categoryIcons = {
    "Ăn uống":
      "M17 2a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2h-2zm-4 4a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2zm-4-4a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H7z",
    "Đi lại":
      "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    "Mua sắm":
      "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z",
  };
  const path =
    categoryIcons[category] || "M20 7l-8.225 8.225-3.525-3.525-4.25 4.25V7H20z";
  return (
    <svg
      className="w-6 h-6 mr-3 text-slate-400 dark:text-slate-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={path}></path>
    </svg>
  );
};

export const TransactionIcon = memo(TransactionIconComponent);
