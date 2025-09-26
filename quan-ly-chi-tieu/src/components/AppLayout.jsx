import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { ConfirmDialog } from "./ConfirmDialog";
import { UndoToast } from "./UndoToast";
import { BudgetWarningToast } from "./BudgetWarningToast";
import { DeleteDataDialog } from "./DeleteDataDialog";
import { SetPinDialog } from "./SetPinDialog";
import { PinLockScreen } from "./PinLockScreen";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.lang = "vi-VN";
  recognition.interimResults = false;
}

const convertVietnameseNumberToDigits = (text) => {
  const numberMap = {
    không: 0,
    một: 1,
    hai: 2,
    ba: 3,
    tư: 4,
    bốn: 4,
    năm: 5,
    sáu: 6,
    bảy: 7,
    tám: 8,
    chín: 9,
    mười: 10,
    mươi: 10,
    trăm: 100,
    nghìn: 1000,
    ngàn: 1000,
    triệu: 1000000,
    tỷ: 1000000000,
  };

  // Chuẩn hóa các từ đặc biệt
  let processedText = text
    .toLowerCase()
    .replace(/lăm/g, "năm") // hai mươi lăm -> hai mươi năm
    .replace(/mốt/g, "một") // hai mươi mốt -> hai mươi một
    .replace(/linh/g, ""); // một trăm linh năm -> một trăm năm

  // Xử lý "rưỡi"
  if (processedText.includes("rưỡi")) {
    // triệu rưỡi -> 1.5 triệu, trăm rưỡi -> 150 (nghìn)
    processedText = processedText.replace(/(\w+)\s+rưỡi/g, (match, p1) => {
      if (p1 === "triệu") return "1.5 triệu";
      if (p1 === "tỷ") return "1.5 tỷ";
      // "trăm rưỡi" -> 150 nghìn, "hai trăm rưỡi" -> 250 nghìn
      if (p1 === "trăm") return "150 nghìn";
      const prevWord = processedText.split(" ").slice(-2, -1)[0];
      if (numberMap[prevWord]) {
        return `${numberMap[prevWord]}50 nghìn`; // hai trăm rưỡi
      }
      return match;
    });
    processedText = processedText.replace("rưỡi", "");
  }

  const words = processedText.split(/\s+/).filter(Boolean);
  let total = 0;
  let currentNumber = 0;

  for (const word of words) {
    const num = parseFloat(word.replace(",", ".")); // Hỗ trợ "1,5" hoặc "1.5"
    if (!isNaN(num) && isFinite(num)) {
      currentNumber = currentNumber === 0 ? num : currentNumber * num;
      continue;
    }

    const value = numberMap[word];
    if (value) {
      if (value >= 1000) {
        // nghìn, triệu, tỷ
        total += (currentNumber || 1) * value;
        currentNumber = 0;
      } else if (value === 100) {
        // trăm
        currentNumber = (currentNumber || 1) * value;
      } else {
        // số từ 0-10
        currentNumber += value;
      }
    }
  }

  total += currentNumber;

  // Nếu chỉ nói "hai trăm", "năm trăm" -> hiểu là 200.000, 500.000
  if (
    total < 1000 &&
    total >= 100 &&
    (text.includes("trăm") || text.includes("nghìn") || text.includes("ngàn"))
  ) {
    return total * 1000;
  }

  return total;
};

/**
 * Helper function to speak text using the browser's Speech Synthesis API.
 * @param {string} text The text to be spoken.
 */
const speak = (text, isEnabled, selectedVoiceURI) => {
  if (isEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN"; // Set language to Vietnamese
    if (selectedVoiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
};

export const AppLayout = () => {
  const {
    isAppLocked,
    budgets,
    addTransaction,
    showToast,
    setActiveView,
    isVoiceFeedbackEnabled,
    selectedVoiceURI,
    // Giả sử bạn có các hàm và state này trong context để cập nhật form
    // Nếu không, bạn cần truyền chúng xuống từ AppLayout hoặc quản lý trong MainContent
    // setFormContent,
    // setFormAmount,
    // setFormCategory,
  } = useAppContext();
  const [isListening, setIsListening] = useState(false);
  const [voiceTransaction, setVoiceTransaction] = useState(null);

  const processVoiceCommand = useCallback(
    (transcript) => {
      console.log("Transcript:", transcript);
      const lowerCaseTranscript = transcript.toLowerCase();

      // Xử lý từ khóa "hủy"
      if (lowerCaseTranscript.includes("hủy")) {
        setVoiceTransaction(null);
        speak("Đã hủy", isVoiceFeedbackEnabled, selectedVoiceURI);
        showToast("Đã hủy các thông tin vừa nhập.", "info");
        return; // Dừng xử lý
      }

      let updatedTransaction = voiceTransaction ? { ...voiceTransaction } : {};

      // Xác định loại giao dịch (thu nhập/chi tiêu)
      const isIncome =
        lowerCaseTranscript.includes("thu nhập") ||
        lowerCaseTranscript.includes("khoản thu");
      const transactionType = isIncome ? "income" : "expense";
      const transactionTypeName = isIncome ? "Thu nhập" : "Chi tiêu";

      // Tìm tên giao dịch
      const nameMatch = lowerCaseTranscript.match(
        /(?:giao dịch|khoản thu|thu nhập) (?:có tên là|tên là|là) (.+?)(?: với số tiền| và số tiền| với danh mục|$)/
      );
      if (nameMatch && nameMatch[1]) {
        const text = nameMatch[1].trim();
        updatedTransaction.text = text; // Sửa 'content' thành 'text'
        const feedback = `Đã nhận diện tên ${transactionTypeName}: ${text}`;
        showToast(feedback);
        speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
      }

      // Tìm số tiền
      const amountMatch = lowerCaseTranscript.match(
        /(?:với số tiền là|số tiền là|là) (.+?) (?:đồng|và|$)/
      );
      if (amountMatch && amountMatch[1]) {
        const amountText = amountMatch[1].trim();
        let amount = 0;
        // Ưu tiên nhận dạng số trước
        const digitsOnly = amountText.replace(/[.,\s]/g, "");
        if (/^\d+$/.test(digitsOnly)) {
          amount = parseFloat(digitsOnly);
        } else {
          // Nếu không phải là số, thử chuyển đổi từ chữ
          amount = convertVietnameseNumberToDigits(amountText);
        }

        if (amount > 0) {
          updatedTransaction.amount = amount;
          const feedback = `Đã nhận diện số tiền: ${amount.toLocaleString(
            "vi-VN"
          )} đồng`;
          showToast(feedback.replace(" đồng", "đ"));
          speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
        }
      }

      // Tìm danh mục
      const categoryMatch = lowerCaseTranscript.match(
        /(?:với danh mục là|danh mục là|là) (.+?)(?: và|$)/
      );
      if (categoryMatch && categoryMatch[1]) {
        const categoryName = categoryMatch[1].trim().toLowerCase();
        // Giả sử danh mục thu nhập và chi tiêu đều nằm trong `budgets`
        // Tìm kiếm trong danh sách tên (key) của các ngân sách
        const foundBudgetName = Object.keys(budgets).find(
          (budgetName) => budgetName.toLowerCase() === categoryName
        );

        if (foundBudgetName) {
          updatedTransaction.categoryId = foundBudgetName; // Lưu lại tên danh mục
          const feedback = `Đã nhận diện danh mục: ${foundBudgetName}`;
          showToast(feedback);
          speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
        } else {
          const feedback = `Không tìm thấy danh mục ${categoryName}`;
          showToast(`${feedback}`, "error");
          speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
        }
      }

      // Xác nhận thêm giao dịch
      if (lowerCaseTranscript.includes("ok")) {
        if (updatedTransaction.text && updatedTransaction.amount) {
          // Sửa 'content' thành 'text'
          const newTransaction = {
            ...updatedTransaction,
            type: transactionType,
            date: new Date(),
          };
          addTransaction(newTransaction);
          const feedback = `Đã thêm giao dịch ${transactionTypeName}`;
          showToast(`${feedback}...`, "success");
          speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
          setVoiceTransaction(null); // Reset sau khi thêm
          setIsListening(false); // Dừng lắng nghe
        } else {
          const feedback = "Vui lòng cung cấp đủ tên và số tiền.";
          showToast(feedback, "error");
          speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
        }
        return; // Dừng xử lý sau khi OK
      }

      setVoiceTransaction(updatedTransaction);
    },
    [
      voiceTransaction,
      budgets,
      addTransaction,
      showToast,
      setActiveView,
      isVoiceFeedbackEnabled,
      selectedVoiceURI,
    ] // Thêm các dependency nếu cần
  );

  // Effect này chỉ để quản lý việc bắt đầu và dừng recognition
  useEffect(() => {
    if (!recognition) return;
    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // Effect này chỉ để lắng nghe kết quả và gọi hàm xử lý
  useEffect(() => {
    if (!recognition || !isListening) return;

    const handleResult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      processVoiceCommand(transcript);
    };

    recognition.addEventListener("result", handleResult);
    return () => recognition.removeEventListener("result", handleResult);
  }, [isListening, processVoiceCommand]);

  const toggleListening = () => {
    if (!recognition) {
      showToast(
        "Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.",
        "error"
      );
      return;
    }
    if (!isListening) {
      setActiveView("add"); // Tự động chuyển sang tab "Thêm Mới"
      const feedback = "Bắt đầu ghi âm";
      setVoiceTransaction({}); // Bắt đầu một giao dịch mới
      showToast(`${feedback}...`, "info");
      speak(feedback, isVoiceFeedbackEnabled, selectedVoiceURI);
    } else {
      showToast("Đã dừng ghi âm.", "info");
    }
    setIsListening((prevState) => !prevState);
  };

  if (isAppLocked) return <PinLockScreen />;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans">
      <style>{`
                .react-datepicker-wrapper input { width: 100%; cursor: pointer; }
                .react-datepicker { font-family: inherit; border-color: #cbd5e1; }
                .react-datepicker__header { background-color: #f1f5f9; border-bottom-color: #cbd5e1; }
                .dark .react-datepicker { background-color: #1e293b; border-color: #475569; }
                .dark .react-datepicker__header { background-color: #334155; border-bottom-color: #475569; }
                .dark .react-datepicker__day-name, .dark .react-datepicker__day, .dark .react-datepicker__current-month { color: #e2e8f0; }
                .dark .react-datepicker__day:hover, .dark .react-datepicker__day--keyboard-selected { background-color: #475569; }
                .dark .react-datepicker__day--selected, .dark .react-datepicker__day--in-selecting-range, .dark .react-datepicker__day--in-range { background-color: #4f46e5; }
                .dark .react-datepicker__day--disabled { color: #64748b; }
            `}</style>
      <Sidebar isListening={isListening} toggleListening={toggleListening} />
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <MainContent voiceTransaction={voiceTransaction} />
      </main>
      <ConfirmDialog />
      <UndoToast />
      <BudgetWarningToast />
      <DeleteDataDialog />
      <SetPinDialog />
    </div>
  );
};
