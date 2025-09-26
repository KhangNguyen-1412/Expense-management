import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../config/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError("");
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error("Lỗi đăng nhập ẩn danh:", err);
          setAuthError(
            'Lỗi kết nối hoặc cấu hình. Đảm bảo đã bật "Anonymous" sign-in trong Firebase Authentication và kiểm tra lại các quy tắc bảo mật của Firestore.'
          );
        });
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, authError, isLoadingAuth };
};
