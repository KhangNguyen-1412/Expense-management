import { useState, useEffect } from "react";
import { doc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../config/firebase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (user) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (isSupported && navigator.serviceWorker.ready) {
        const sub = await navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager.getSubscription()
        );
        setIsSubscribed(!!sub);
        setSubscription(sub);
      }
    };
    checkSubscription();
  }, [isSupported]);

  const subscribeToPush = async () => {
    if (!user) return;
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save subscription to Firestore
      const userDocRef = doc(db, `users/${user.uid}`);
      await setDoc(
        userDocRef,
        { pushSubscriptions: { [sub.endpoint]: sub.toJSON() } },
        { merge: true }
      );

      setIsSubscribed(true);
      setSubscription(sub);
      alert("Đã bật thông báo đẩy thành công!");
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      alert(
        "Không thể bật thông báo. Vui lòng cấp quyền trong cài đặt trình duyệt."
      );
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription || !user) return;
    try {
      await subscription.unsubscribe();
      // Remove subscription from Firestore
      const userDocRef = doc(db, `users/${user.uid}`);
      await updateDoc(userDocRef, {
        [`pushSubscriptions.${subscription.endpoint}`]: deleteField(),
      });
      setIsSubscribed(false);
      setSubscription(null);
      alert("Đã tắt thông báo đẩy.");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    }
  };

  return { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush };
};
