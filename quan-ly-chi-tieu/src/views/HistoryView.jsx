import React, { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Transaction } from "../components/Transaction";
import { useAppContext } from "../context/AppContext";
import { TransactionSkeleton } from "../components/TransactionSkeleton";
import { exportToCSV } from "../utils/csvExporter";
import { importFromCSV } from "../utils/csvImporter";
import { CSVGuideDialog } from "../components/CSVGuideDialog";
import { MergeTransactionsDialog } from "../components/MergeTransactionsDialog";
import "../styles/HistoryView.css";
export const HistoryView = () => {
  const { transactions, isLoadingData, addMultipleTransactions, showToast } =
    useAppContext();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc"); // 'date_desc', 'amount_desc', 'amount_asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const ITEMS_PER_PAGE = 10; // Số giao dịch trên mỗi trang

  // Tự động quay về trang 1 khi người dùng thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm, sortBy, dateRange]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
    );

    // Tạo một bản sao để tránh thay đổi mảng gốc từ context
    let results = [...transactions];

    if (filter === "today") {
      results = transactions.filter((t) => {
        if (!t.createdAt?.seconds) return false;
        return new Date(t.createdAt.seconds * 1000) >= today;
      });
    }
    if (filter === "week") {
      results = transactions.filter((t) => {
        if (!t.createdAt?.seconds) return false;
        return new Date(t.createdAt.seconds * 1000) >= startOfWeek;
      });
    } else if (
      filter === "custom" &&
      dateRange.startDate &&
      dateRange.endDate
    ) {
      const startOfDay = new Date(dateRange.startDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateRange.endDate.setHours(23, 59, 59, 999));
      results = transactions.filter((t) => {
        if (!t.createdAt?.seconds) return false;
        const transDate = new Date(t.createdAt.seconds * 1000);
        return transDate >= startOfDay && transDate <= endOfDay;
      });
    }

    if (searchTerm.trim() !== "") {
      results = results.filter((t) =>
        t.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp kết quả
    if (sortBy === "amount_desc") {
      results.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount_asc") {
      results.sort((a, b) => a.amount - a.amount);
    }
    // Mặc định 'date_desc' đã được sắp xếp từ Firestore, nên không cần làm gì thêm.

    return results;
  }, [transactions, filter, searchTerm, sortBy, dateRange]);

  const selectedTransactions = useMemo(() => {
    return transactions.filter((t) => selectedIds.has(t.id));
  }, [transactions, selectedIds]);

  const handleToggleSelection = (id) => {
    const newSelection = new Set(selectedIds);
    newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      showToast("Không có dữ liệu để xuất.", "info");
      return;
    }
    exportToCSV(
      filteredTransactions,
      `giao-dich-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn nhập dữ liệu từ file "${file.name}" không?`
      )
    ) {
      event.target.value = null; // Reset file input
      return;
    }

    try {
      const newTransactions = await importFromCSV(file);
      const count = await addMultipleTransactions(newTransactions);
      if (count > 0) {
        showToast(`Đã nhập thành công ${count} giao dịch!`, "success");
      } else {
        showToast("Không có giao dịch nào được nhập.", "info");
      }
    } catch (error) {
      console.error("Lỗi khi nhập file CSV:", error);
      showToast(`Đã xảy ra lỗi khi nhập file: ${error.message}`, "error");
    } finally {
      event.target.value = null; // Reset file input để có thể chọn lại cùng file
    }
  };

  // Tính toán danh sách giao dịch cho trang hiện tại
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const handleFilterClick = (value) => {
    setFilter(value);
    setDateRange({ startDate: null, endDate: null }); // Reset date range when using presets
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange({ startDate: start, endDate: end });
    if (start && end) {
      setFilter("custom"); // Activate custom filter when both dates are selected
    }
  };

  const FilterButton = ({ value, label }) => (
    <button
      onClick={() => handleFilterClick(value)}
      className={`filter-btn ${
        filter === value ? "filter-btn-active" : "filter-btn-inactive"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="history-container">
      <div className="history-header">
        <h3 className="history-title">Lịch sử Giao dịch</h3>
        <div className="history-controls">
          <div className="control-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date_desc">Sắp xếp: Mới nhất</option>
              <option value="amount_desc">Sắp xếp: Tiền giảm dần</option>
              <option value="amount_asc">Sắp xếp: Tiền tăng dần</option>
            </select>
            <div className="select-arrow">
              <svg
                className="select-arrow-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
          </div>
          <div className="control-wrapper">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon-wrapper">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="datepicker-container">
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateChange}
              isClearable={true}
              placeholderText="Lọc theo khoảng ngày"
              dateFormat="dd/MM/yyyy"
              className="history-datepicker"
            />
          </div>
          <div className="filter-buttons">
            <FilterButton value="all" label="Tất cả" />
            <FilterButton value="today" label="Hôm nay" />
            <FilterButton value="week" label="Tuần này" />
          </div>
          <div className="action-buttons">
            <button
              onClick={handleExport}
              className="action-btn action-btn-export"
              aria-label="Xuất ra file CSV"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="action-btn-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <label
                htmlFor="csv-import-input"
                className="action-btn action-btn-import rounded-r-none"
                aria-label="Nhập từ file CSV"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="action-btn-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </label>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="action-btn action-btn-guide rounded-l-none"
                aria-label="Hướng dẫn nhập CSV"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="action-btn-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
            <input
              type="file"
              id="csv-import-input"
              className="hidden-input"
              accept=".csv"
              onChange={handleImport}
            />
          </div>
        </div>
      </div>
      <CSVGuideDialog
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      <MergeTransactionsDialog
        isOpen={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        selectedTransactions={selectedTransactions}
      />
      {selectedIds.size > 1 && (
        <div className="merge-banner">
          <span className="merge-info">
            Đã chọn {selectedIds.size} giao dịch
          </span>
          <button
            onClick={() => setIsMergeDialogOpen(true)}
            className="merge-button"
          >
            Gộp giao dịch
          </button>
        </div>
      )}
      {/* Table Container with scroll */}
      <div className="table-container">
        <table className="history-table">
          <thead className="table-header">
            <tr>
              <th className="p-3 w-12">
                {/* Optional: Add a select-all checkbox here */}
              </th>
              <th className="table-header-cell">Tên giao dịch</th>
              <th className="table-header-cell text-right">Số tiền</th>
              <th className="table-header-cell text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingData ? (
              Array(5)
                .fill(0)
                .map((_, index) => <TransactionSkeleton key={index} />)
            ) : paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t) => (
                <Transaction
                  key={t.id}
                  transaction={t}
                  isSelected={selectedIds.has(t.id)}
                  onToggleSelection={handleToggleSelection}
                />
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-cell">
                  Không có giao dịch nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile Card List */}
      <div className="mobile-list-container">
        {isLoadingData ? (
          Array(5)
            .fill(0)
            .map((_, index) => <TransactionSkeleton key={index} />)
        ) : paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((t) => (
            <Transaction
              key={t.id}
              transaction={t}
              isSelected={selectedIds.has(t.id)}
              onToggleSelection={handleToggleSelection}
            />
          ))
        ) : (
          <p className="no-data-text">
            Không có giao dịch nào phù hợp với bộ lọc.
          </p>
        )}
      </div>
      {!isLoadingData && totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Trước
          </button>
          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
