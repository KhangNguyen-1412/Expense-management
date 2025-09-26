import { useState } from "react";
// ❌ XÓA DÒNG IMPORT GÂY RA PHỤ THUỘC VÒNG
// import { formatCurrency } from "../utils/formatCurrency";

// ✅ TRUYỀN HÀM formatCurrency VÀO NHƯ MỘT THAM SỐ
export const useGeminiAnalysis = (transactions, formatCurrency) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyzeSpending = async () => {
    // Thêm một kiểm tra để đảm bảo formatCurrency đã được cung cấp
    if (typeof formatCurrency !== "function") {
      const errorMessage =
        "Lỗi: Hàm formatCurrency chưa được cung cấp cho useGeminiAnalysis.";
      console.error(errorMessage);
      setError(errorMessage);
      return;
    }

    if (transactions.length === 0) {
      setError("Không có giao dịch nào để phân tích.");
      setAnalysis("");
      return;
    }
    setIsLoading(true);
    setError("");
    setAnalysis("");

    const transactionList = transactions
      .map(
        (t) =>
          `- ${t.text}: ${formatCurrency(t.amount)}${
            // ✅ Vẫn sử dụng bình thường
            t.category ? ` (Hạng mục: ${t.category})` : ""
          }`
      )
      .join("\n");

    const prompt = `Với vai trò là một chuyên gia tài chính cá nhân, hãy phân tích danh sách giao dịch (bao gồm cả thu nhập và chi tiêu) sau của người dùng Việt Nam. Dựa vào dữ liệu, hãy:
1. Đưa ra nhận xét tổng quan về tình hình tài chính (tỷ lệ thu/chi, dòng tiền).
2. Xác định các nguồn thu nhập chính và các hạng mục chi tiêu lớn nhất.
3. Phân tích xem có điểm nào bất thường hoặc cơ hội nào để cải thiện không (ví dụ: chi tiêu không cần thiết, cơ hội tăng thu nhập).
4. Đưa ra 2-3 lời khuyên cụ thể, hữu ích để giúp họ quản lý tài chính tốt hơn.
Vui lòng trả lời bằng tiếng Việt, giọng văn khích lệ, và sử dụng định dạng HTML (<strong>, <ul>, <li>, <p>).
Dữ liệu giao dịch:
${transactionList}`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API call failed: ${response.status}`);
      const result = await response.json();
      setAnalysis(result.candidates[0].content.parts[0].text);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError(
        "Rất tiếc, đã có lỗi khi kết nối với chuyên gia AI. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { analysis, isLoading, error, handleAnalyzeSpending };
};
