import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const LOCAL_STORAGE_POSTS_KEY = "user_posts_feed_";

export const usePosts = (user) => {
  const [posts, setPosts] = useState(() => {
    const storageKey = LOCAL_STORAGE_POSTS_KEY + (user?.uid || "guest");
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local posts", e);
      }
    }
    return [];
  });
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const getStorageKey = useCallback(() => {
    return LOCAL_STORAGE_POSTS_KEY + (user?.uid || "guest");
  }, [user]);

  // Sync posts from Firestore if user exists
  useEffect(() => {
    if (!user) {
      setIsLoadingPosts(false);
      return;
    }

    const storageKey = getStorageKey();
    const postsColRef = collection(db, `users/${user.uid}/posts`);
    const q = query(postsColRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setPosts(fetchedPosts);
        localStorage.setItem(storageKey, JSON.stringify(fetchedPosts));
        setIsLoadingPosts(false);
      },
      (error) => {
        console.error("Error listening to posts updates:", error);
        setIsLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, [user, getStorageKey]);

  // Add a new post
  const addPost = useCallback(
    async (postData) => {
      const newId = `post_${Date.now()}`;
      const newPost = {
        id: newId,
        caption: postData.caption || "",
        imageUrl: postData.imageUrls?.[0] || postData.imageUrl || "",
        imageUrls: postData.imageUrls || (postData.imageUrl ? [postData.imageUrl] : []),
        location: postData.location || "",
        layoutStyle: postData.layoutStyle || "frame",
        likesCount: 0,
        isLiked: false,
        createdAt: postData.createdAt || new Date().toISOString(),
        authorName: postData.authorName || user?.displayName || "Thành viên",
        authorAvatar: postData.authorAvatar || user?.photoURL || "",
      };

      setPosts((prev) => [newPost, ...prev]);
      const storageKey = getStorageKey();
      const updated = [newPost, ...posts];
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, newId);
          await setDoc(docRef, newPost);
        } catch (err) {
          console.error("Failed to add post to Firestore:", err);
        }
      }
    },
    [user, posts, getStorageKey]
  );

  // Delete a post
  const deletePost = useCallback(
    async (postId) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      const storageKey = getStorageKey();
      const updated = posts.filter((p) => p.id !== postId);
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, postId);
          await deleteDoc(docRef);
        } catch (err) {
          console.error("Failed to delete post from Firestore:", err);
        }
      }
    },
    [user, posts, getStorageKey]
  );

  // Toggle Like on a post
  const toggleLikePost = useCallback(
    async (postId) => {
      let updatedPost = null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const isLiked = !p.isLiked;
            const likesCount = isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 1) - 1);
            updatedPost = { ...p, isLiked, likesCount };
            return updatedPost;
          }
          return p;
        })
      );

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
