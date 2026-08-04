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

const LOCAL_STORAGE_POSTS_KEY = "user_posts_feed_v2_";

export const usePosts = (user) => {
  const getStorageKey = useCallback(() => {
    return LOCAL_STORAGE_POSTS_KEY + (user?.uid || "guest");
  }, [user]);

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
    // Fallback: check guest storage
    const guestSaved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY + "guest");
    if (guestSaved) {
      try {
        return JSON.parse(guestSaved);
      } catch (e) {}
    }
    return [];
  });

  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Sync posts from Firestore if user exists
  useEffect(() => {
    const storageKey = getStorageKey();

    if (!user) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setPosts(JSON.parse(saved));
        } catch (e) {}
      }
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

        // Sort descending by createdAt date
        fetchedPosts.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setPosts((prev) => {
          // Merge with any offline/local posts not yet in Firestore
          const firestoreMap = new Map(fetchedPosts.map((p) => [p.id, p]));
          const merged = [...fetchedPosts];

          prev.forEach((localPost) => {
            if (!firestoreMap.has(localPost.id)) {
              merged.push(localPost);
            }
          });

          merged.sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

          localStorage.setItem(storageKey, JSON.stringify(merged));
          return merged;
        });

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

      const storageKey = getStorageKey();

      setPosts((prev) => {
        const updated = [newPost, ...prev.filter((p) => p.id !== newId)];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });

      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/posts`, newId);
          await setDoc(docRef, newPost);
        } catch (err) {
          console.error("Failed to add post to Firestore:", err);
        }
      }
    },
    [user, getStorageKey]
  );

  // Delete a post
  const deletePost = useCallback(
    async (postId) => {
      const storageKey = getStorageKey();

      setPosts((prev) => {
        const updated = prev.filter((p) => p.id !== postId);
        localStorage.setItem(storageKey, JSON.stringify(updated));
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
    [user, getStorageKey]
  );

  // Toggle Like on a post
  const toggleLikePost = useCallback(
    async (postId) => {
      let updatedPost = null;
      const storageKey = getStorageKey();

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

        localStorage.setItem(storageKey, JSON.stringify(updated));
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
    [user, getStorageKey]
  );

  return { posts, isLoadingPosts, addPost, deletePost, toggleLikePost };
};
