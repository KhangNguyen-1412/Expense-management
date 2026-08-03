/**
 * Converts an array of transaction objects to a CSV string.
 * @param {Array<object>} data The array of transactions.
 * @returns {string} The CSV formatted string.
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = ["ID", "Nội dung", "Số tiền", "Hạng mục", "Ngày tạo"];
  const rows = data.map((transaction) => {
    const date = transaction.createdAt
      ? new Date(transaction.createdAt.seconds * 1000).toLocaleDateString(
          "vi-VN"
        )
      : "";
    // Escape commas and quotes in the text field
    const text = `"${transaction.text.replace(/"/g, '""')}"`;

    return [
      transaction.id,
      text,
      transaction.amount,
      transaction.category || "",
      date,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Triggers a browser download for the given CSV string.
 * @param {string} csvString The CSV content.
 * @param {string} filename The desired filename for the download.
 */
export function exportToCSV(data, filename = "giao-dich.csv") {
  const csvString = convertToCSV(data);
  const blob = new Blob([`\uFEFF${csvString}`], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
