import React, { memo } from "react";

export const CATEGORY_ICON_PATHS = {
  "Ăn uống": "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.46 3.9 3.45 4.38L6 22h2l.55-8.62C10.54 12.9 12 11.12 12 9V2h-1v7zm6-7v12h2V2h-2zm-3 0v20h2V2h-2z",
  "Đi lại": "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z",
  "Hóa đơn": "M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2l-1.5 1.5L6 2l-1.5 1.5L3 2v20z",
  "Mua sắm": "M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z",
  "Giải trí": "M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z",
  "Sức khỏe": "M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
  "Giáo dục": "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  "Gia đình": "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  "Tiết kiệm": "M15 10V8h2V6h-2V4h-2v2h-2v2h2v2h2zm-2-9C7.34 1 2 6.34 2 12s5.34 11 11 11 11-5.34 11-11S18.66 1 13 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9z",
  "Khác": "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
};

const TransactionIconComponent = ({ category, className = "w-5 h-5 mr-3 text-emerald-800 dark:text-emerald-400" }) => {
  const path = CATEGORY_ICON_PATHS[category] || "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={path}></path>
    </svg>
  );
};

export const TransactionIcon = memo(TransactionIconComponent);
