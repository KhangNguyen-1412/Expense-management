/**
 * Chứa các mẫu câu và từ khóa để nhận dạng giọng nói.
 */

// Các từ khóa để nhận dạng các phần của câu lệnh
const keywords = {
  transaction: "(?:giao dịch|khoản chi)",
  income: "(?:thu nhập|khoản thu)",
  name: "(?:có tên là|tên là|là)",
  amount: "(?:với số tiền là|số tiền là|là)",
  category: "(?:với danh mục là|danh mục là|là)",
  end: "(?:đồng|và|$)",
};

// Các biểu thức chính quy (regex) để phân tích câu lệnh
export const voiceCommandPatterns = {
  // Ví dụ: "thêm [thu nhập] [tên giao dịch] với số tiền là [số tiền] với danh mục là [danh mục]"
  getName: new RegExp(
    `(?:${keywords.transaction}|${keywords.income}) ${keywords.name} (.+?)(?: với số tiền| và số tiền| với danh mục|$)`,
    "i"
  ),
  getAmount: new RegExp(`${keywords.amount} (.+?) ${keywords.end}`, "i"),
  getCategory: new RegExp(`${keywords.category} (.+?)(?: và|$)`, "i"),
};

// Các từ khóa hành động và phân loại
export const actionKeywords = { confirm: "ok", cancel: "hủy" };
export const incomeKeywords = ["thu nhập", "khoản thu"];
