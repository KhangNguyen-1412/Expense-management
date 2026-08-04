import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { compressImage } from "../utils/imageUtils";

const MASTER_POSTS_STORAGE_KEY = "master_photo_feed_posts_v4";

// Helper: Safely load posts from master local storage
const loadLocalPosts = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const masterSaved = localStorage.getItem(MASTER_POSTS_STORAGE_KEY);
    if (masterSaved) {
      const parsed = JSON.parse(masterSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Fallback: check legacy keys
    const fallbackSaved =
      localStorage.getItem("user_posts_feed_v3_guest") ||
      localStorage.getItem("user_posts_feed_v2_guest");
    if (fallbackSaved) {
      const parsed = JSON.parse(fallbackSaved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading local posts:", e);
  }
  return [];
};

// Helper: Safely write posts to LocalStorage without quota overflow
const saveLocalPosts = (data) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(MASTER_POSTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("LocalStorage quota exceeded, pruning old posts...", e);
    try {
      const pruned = data.slice(0, 25);
      localStorage.setItem(MASTER_POSTS_STORAGE_KEY, JSON.stringify(pruned));
    } catch (err) {
      console.error("Failed to write to LocalStorage:", err);
    }
  }
};

export const usePosts = (user) => {
  // Simple, safe initial state
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // 1. Initial synchronous load from LocalStorage on mount
  useEffect(() => {
    const local = loadLocalPosts();
    if (local.length > 0) {
      setPosts(local);
    }
  }, []);

  // 2. Sync posts from Firestore if user exists
  useEffect(() => {
    if (!user) {
      const local = loadLocalPosts();
      setPosts(local);
      setIsLoadingPosts(false);
      return;
    }

    const postsColRef = collection(db, `users/${user.uid}/posts`);

    const unsubscribe = onSnapshot(
      postsColRef,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));

        // Always read current local posts to avoid wiping offline/draft posts
        const currentLocal = loadLocalPosts();
        const firestoreMap = new Map(fetchedPosts.map((p) => [p.id, p]));

        const merged = [...fetchedPosts];

        // Retain any local post not yet synced to Firestore
        currentLocal.forEach((localPost) => {
          if (!firestoreMap.has(localPost.id)) {
            merged.push(localPost);
          }
        });

        // Sort descending by createdAt
        merged.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setPosts(merged);
        saveLocalPosts(merged);
        setIsLoadingPosts(false);
      },
      (error) => {
        console.error("Error listening to Firestore posts:", error);
        setIsLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add a new post
  const addPost = useCallback(
    async (postData) => {
      const newId = `post_${Date.now()}`;

      // Compress all images to prevent Firestore 1MB document limit error
      let compressedImages = [];
      if (postData.imageUrls && Array.isArray(postData.imageUrls) && postData.imageUrls.length > 0) {
        compressedImages = await Promise.all(
          postData.imageUrls.map((img) => compressImage(img, 800, 0.6))
        );
      } else if (postData.imageUrl) {
        const compressed = await compressImage(postData.imageUrl, 800, 0.6);
        compressedImages = [compressed];
      }

      const newPost = {
        id: newId,
        caption: postData.caption || "",
        imageUrl: compressedImages[0] || "",
        imageUrls: compressedImages,
        location: postData.location || "",
        layoutStyle: postData.layoutStyle || "frame",
        likesCount: 0,
        isLiked: false,
        createdAt: postData.createdAt || new Date().toISOString(),
        authorName: postData.authorName || user?.displayName || "Thành viên",
        authorAvatar: postData.authorAvatar || user?.photoURL || "",
      };

      // 1. Immediately update React State & Master LocalStorage synchronously
      setPosts((prev) => {
        const updated = [newPost, ...prev.filter((p) => p.id !== newId)];
        saveLocalPosts(updated);
        return updated;
      });

      // 2. Async save to Cloud Firestore if logged in
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, newId);
          await setDoc(docRef, newPost);
        } catch (err) {
          console.error("Failed to save post to Firestore:", err);
        }
      }
    },
    [user]
  );

  // Delete a post
  const deletePost = useCallback(
    async (postId) => {
      setPosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        saveLocalPosts(updated);
        return updated;
      });

      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, postId);
          await deleteDoc(docRef);
        } catch (err) {
          console.error("Failed to delete post from Firestore:", err);
        }
      }
    },
    [user]
  );

  // Toggle Like on a post
  const toggleLikePost = useCallback(
    async (postId) => {
      let updatedPost = null;

      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === postId) {
            const isLiked = !p.isLiked;
            const likesCount = isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 1) - 1);
            updatedPost = { ...p, isLiked, likesCount };
            return updatedPost;
          }
          return p;
        });

        saveLocalPosts(updated);
        return updated;
      });

      if (user && updatedPost) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, postId);
          await updateDoc(docRef, {
            isLiked: updatedPost.isLiked,
            likesCount: updatedPost.likesCount,
          });
        } catch (err) {
          console.error("Failed to update post like in Firestore:", err);
        }
      }
    },
    [user]
  );

  return { posts, isLoadingPosts, addPost, deletePost, toggleLikePost };
};
