import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { db, auth } from "../config/firebase";

const LOCAL_STORAGE_KEY_PREFIX = "user_profile_";
const MASTER_PROFILE_STORAGE_KEY = "master_user_profile_v1";

// Helper: Load master profile stored locally
const loadMasterProfile = () => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const savedMaster = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
    if (savedMaster) {
      const parsed = JSON.parse(savedMaster);
      if (parsed && (parsed.fullName || parsed.avatarUrl)) return parsed;
    }

    // Scan for any user_profile_ key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCAL_STORAGE_KEY_PREFIX)) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed && (parsed.fullName || parsed.avatarUrl)) return parsed;
        }
      }
    }
  } catch (e) {
    console.error("Error reading master profile:", e);
  }
  return null;
};

export const useUserProfile = (user) => {
  const [profile, setProfile] = useState(() => {
    const master = loadMasterProfile();
    if (master) return master;

    const storageKey = LOCAL_STORAGE_KEY_PREFIX + (user?.uid || "guest");
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local profile", e);
      }
    }
    return {
      fullName: user?.displayName || "Nguyễn Huỳnh Phúc Khang",
      dob: "2002-05-14",
      phoneNumber: "0901234567",
      idCardNumber: "",
      taxId: "8472910382",
      bhxhCode: "8222360105",
      studentId: "14520385",
      school: "Trường Đại học Sư phạm TP.HCM",
      studentEmail: "khangnhp@student.hcmue.edu.vn",
      graduationDate: "Tháng 07/2026",
      certificate: "Chứng chỉ Nghiệp vụ Sư phạm Giảng viên",
      skills: ["ReactJS", "VueJS", "PHP", "Automation Tester", "Financial Planning"],
      experiences: [
        { company: "Apps Cyclone", role: "Software Engineer / Automation Tester Intern", period: "2024 - 2025" },
        { company: "TMA Solutions", role: "Frontend Developer / Automation Tester Intern", period: "2025 - 2026" }
      ],
      socials: {
        instagram: "CuongDuong54",
        github: "https://github.com/nhpk1",
        facebook: "https://facebook.com",
        linkedin: "https://linkedin.com"
      },
      hometown: "An Hữu - Đồng Tháp",
      residence: "KTX Sư Phạm - TP. Hồ Chí Minh",
      pets: ["Vịt 🦆", "Bắp 🌽", "Lạc 🥜"],
      gymGoal: "Physique & Body Fitness Transformation",
      avatarUrl: user?.photoURL || "",
      personalPhotos: [],
      itemPhotos: [],
      permanentAddress: {
        provinceCode: "87",
        wardCode: "",
        streetDetail: "An Hữu",
        fullAddress: "An Hữu, Huyện Châu Thành, Tỉnh Đồng Tháp",
      },
      temporaryAddress: {
        isSameAsPermanent: false,
        provinceCode: "79",
        wardCode: "",
        streetDetail: "KTX Đại học Sư Phạm",
        fullAddress: "KTX Đại học Sư phạm TP. Hồ Chí Minh",
      },
    };
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const getStorageKey = useCallback(() => {
    return LOCAL_STORAGE_KEY_PREFIX + (user?.uid || "guest");
  }, [user]);

  // Sync profile from Firestore (user profile or public showcase)
  useEffect(() => {
    let unsubscribe;

    // For unauthenticated or anonymous users, rely on Master LocalStorage cache to avoid permission errors
    if (!user || user.isAnonymous) {
      const master = loadMasterProfile();
      if (master) setProfile(master);
      setIsLoadingProfile(false);
      return;
    }

    const storageKey = getStorageKey();
    const docRef = doc(db, `users/${user.uid}/profile`, "info");

    try {
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile((prev) => {
              const merged = {
                fullName: data.fullName ?? user.displayName ?? "Nguyễn Huỳnh Phúc Khang",
                dob: data.dob ?? "",
                phoneNumber: data.phoneNumber ?? "",
                idCardNumber: data.idCardNumber ?? "",
                avatarUrl: data.avatarUrl ?? user.photoURL ?? "",
                personalPhotos: data.personalPhotos || [],
                itemPhotos: data.itemPhotos || [],
                permanentAddress: data.permanentAddress || {
                  provinceCode: "",
                  wardCode: "",
                  streetDetail: "",
                  fullAddress: "",
                },
                temporaryAddress: data.temporaryAddress || {
                  isSameAsPermanent: false,
                  provinceCode: "",
                  wardCode: "",
                  streetDetail: "",
                  fullAddress: "",
                },
              };
              localStorage.setItem(storageKey, JSON.stringify(merged));
              localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          } else {
            const savedLocal = localStorage.getItem(storageKey);
            if (savedLocal) {
              try {
                const parsed = JSON.parse(savedLocal);
                setProfile(parsed);
                localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(parsed));
              } catch (err) {
                console.error("Failed to parse local profile:", err);
              }
            } else {
              setProfile((prev) => ({
                ...prev,
                fullName: user.displayName || prev.fullName || "Nguyễn Huỳnh Phúc Khang",
                avatarUrl: user.photoURL || prev.avatarUrl || "",
              }));
            }
          }
          setIsLoadingProfile(false);
        },
        (error) => {
          console.warn("Firestore profile snapshot fallback:", error?.message || error);
          const savedLocal = localStorage.getItem(storageKey) || localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
          if (savedLocal) {
            try {
              setProfile(JSON.parse(savedLocal));
            } catch (e) {}
          }
          setIsLoadingProfile(false);
        }
      );
    } catch (e) {
      console.warn("Firestore profile subscription error:", e);
      setIsLoadingProfile(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, getStorageKey]);

  // Function to save/update user profile
  const updateUserProfile = useCallback(
    async (updatedProfile) => {
      setProfile(updatedProfile);
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
      localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

      // Sync to public showcase doc in Firestore
      try {
        await setDoc(doc(db, "public_showcase", "profile"), updatedProfile, { merge: true });
      } catch (e) {
        console.warn("Public profile write warning:", e);
      }

      // Try updating Firebase Auth profile if available
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        try {
          await updateAuthProfile(auth.currentUser, {
            displayName: updatedProfile.fullName,
            photoURL: updatedProfile.avatarUrl,
          });
        } catch (e) {
          console.warn("Could not update auth profile:", e);
        }
      }

      // Save to Firestore if user exists
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/profile`, "info");
          await setDoc(docRef, updatedProfile, { merge: true });
        } catch (error) {
          console.error("Failed to save profile to Firestore:", error);
        }
      }
    },
    [user, getStorageKey]
  );

  return { profile, isLoadingProfile, updateUserProfile };
};
