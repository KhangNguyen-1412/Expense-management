import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { db, auth } from "../config/firebase";

const LOCAL_STORAGE_KEY_PREFIX = "user_profile_";

export const useUserProfile = (user) => {
  const [profile, setProfile] = useState(() => {
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
      fullName: user?.displayName || "",
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

  // Sync profile from Firestore if user exists
  useEffect(() => {
    if (!user) {
      setIsLoadingProfile(false);
      return;
    }

    const storageKey = getStorageKey();
    const docRef = doc(db, `users/${user.uid}/profile`, "info");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile((prev) => {
            const merged = {
              fullName: data.fullName ?? user.displayName ?? "",
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
            return merged;
          });
        } else {
          // If no doc in Firestore, use local or initial defaults
          const savedLocal = localStorage.getItem(storageKey);
          if (savedLocal) {
            try {
              setProfile(JSON.parse(savedLocal));
            } catch (err) {
              console.error("Failed to parse local profile:", err);
            }
          } else {
            setProfile((prev) => ({
              ...prev,
              fullName: user.displayName || prev.fullName || "",
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

    return () => unsubscribe();
  }, [user, getStorageKey]);

  // Function to save/update user profile
  const updateUserProfile = useCallback(
    async (updatedProfile) => {
      setProfile(updatedProfile);
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedProfile));

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
