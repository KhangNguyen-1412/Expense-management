import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

export const useGeminiAnalysis = (transactions) => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyzeSpending = async () => {
    if (transactions.filter((t) => t.amount < 0).length === 0) {
      setError("Không có giao dịch CHI TIÊU nào để phân tích.");
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
            t.category ? ` (Hạng mục: ${t.category})` : ""
          }`
      )
      .join("\n");

    const prompt = `Với vai trò là một chuyên gia tài chính cá nhân, hãy phân tích danh sách giao dịch sau của người dùng Việt Nam. Dựa vào dữ liệu, hãy:
1. Đưa ra nhận xét tổng quan về tình hình tài chính.
2. Xác định các hạng mục chi tiêu lớn nhất và phân tích xem có điểm nào bất thường không.
3. Đưa ra 2-3 lời khuyên cụ thể, hữu ích để giúp họ tối ưu hóa chi tiêu.
Vui lòng trả lời bằng tiếng Việt, giọng văn khích lệ, và sử dụng định dạng HTML (<strong>, <ul>, <li>, <p>).
Dữ liệu giao dịch:
${transactionList}`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Lấy API Key từ biến môi trường
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
