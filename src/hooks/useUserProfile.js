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
      dob: "",
      phoneNumber: "",
      idCardNumber: "",
      avatarUrl: user?.photoURL || "",
      personalPhotos: [],
      itemPhotos: [],
      permanentAddress: {
        provinceCode: "",
        wardCode: "",
        streetDetail: "",
        fullAddress: "",
      },
      temporaryAddress: {
        isSameAsPermanent: false,
        provinceCode: "",
        wardCode: "",
        streetDetail: "",
        fullAddress: "",
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

    if (!user) {
      // For visitors without login, listen to public_showcase profile in Firestore
      const publicDocRef = doc(db, "public_showcase", "profile");
      unsubscribe = onSnapshot(
        publicDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile((prev) => {
              const merged = { ...prev, ...data };
              localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          }
          setIsLoadingProfile(false);
        },
        (err) => {
          console.warn("Public profile fetch warning:", err);
          setIsLoadingProfile(false);
        }
      );
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }

    const storageKey = getStorageKey();
    const docRef = doc(db, `users/${user.uid}/profile`, "info");

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

          // Also sync to public showcase for visitors
          try {
            setDoc(doc(db, "public_showcase", "profile"), data, { merge: true });
          } catch (e) {
            console.warn("Error syncing public profile:", e);
          }
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
        console.error("Error listening to profile updates:", error);
        setIsLoadingProfile(false);
      }
    );

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
