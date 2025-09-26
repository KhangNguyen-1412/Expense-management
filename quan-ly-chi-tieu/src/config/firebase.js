import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
} from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyASuFkA_nSITnxb4sWr_MDEDx1n41ejih0",
  authDomain: "wweb-34134.firebaseapp.com",
  projectId: "wweb-34134",
  storageBucket: "wweb-34134.appspot.com",
  messagingSenderId: "103296355774",
  appId: "1:103296355774:web:d5d4ca8bd1127ef2957def",
  measurementId: "G-0PSEW4N99E",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      // Nếu người dùng hiện tại là ẩn danh, hãy liên kết tài khoản Google
      const result = await linkWithPopup(auth.currentUser, provider);
      console.log(
        "Tài khoản ẩn danh đã được nâng cấp thành công:",
        result.user
      );
    } else {
      // Nếu không, thực hiện đăng nhập bình thường
      await signInWithPopup(auth, provider);
    }
  } catch (error) {
    if (error.code === "auth/credential-already-in-use") {
      // Lỗi này xảy ra khi tài khoản Google đã được liên kết với một người dùng khác.
      // Bạn có thể xử lý phức tạp hơn bằng cách cho phép người dùng đăng nhập vào tài khoản cũ
      // và chuyển dữ liệu, nhưng cách đơn giản nhất là thông báo cho họ.
      alert(
        "Tài khoản Google này đã được sử dụng. Vui lòng đăng nhập bằng tài khoản đó hoặc chọn một tài khoản Google khác."
      );
      console.error("Lỗi liên kết tài khoản:", error);
    } else {
      console.error("Lỗi đăng nhập Google:", error);
    }
  }
};

export const handleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
};
