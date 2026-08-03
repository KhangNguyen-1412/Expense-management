import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signInWithCredential,
  GoogleAuthProvider as AuthProvider, // Alias to avoid confusion
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
      // This error means the Google account is already linked to another user.
      // We can sign the user in with that existing account.
      console.log("Tài khoản Google đã tồn tại, đang tiến hành đăng nhập...");
      try {
        // Get the credential from the error
        const credential = AuthProvider.credentialFromError(error);
        // Sign in with the existing credential
        await signInWithCredential(auth, credential);
        console.log("Đăng nhập thành công vào tài khoản đã có.");
      } catch (signInError) {
        console.error("Lỗi khi đăng nhập bằng tài khoản đã có:", signInError);
        alert(
          "Tài khoản Google này đã được sử dụng. Không thể tự động đăng nhập."
        );
      }
    } else {
      console.error("Lỗi đăng nhập Google:", error);
      alert("Đã xảy ra lỗi khi đăng nhập bằng Google.");
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
