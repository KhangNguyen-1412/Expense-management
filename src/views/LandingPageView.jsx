import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { convertGoogleDriveUrl } from "../utils/imageUtils";

export const LandingPageView = () => {
  const {
    user,
    profile,
    posts = [],
    total,
    goals = [],
    theme,
    toggleTheme,
    formatCurrency,
    setActiveView,
    handleGoogleSignIn,
  } = useAppContext();

  const isGuest = !user || user.isAnonymous;
  const authorName = profile?.fullName || user?.displayName || "Nguyễn Huỳnh Phúc Khang";
  const authorAvatar = profile?.avatarUrl || user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  // Gallery view mode default to authentic "polaroid" prints
  const [galleryViewMode, setGalleryViewMode] = useState("polaroid");
  const [selectedTag, setSelectedTag] = useState("all");

  // Lightbox modal state: { currentIndex: 0, customPhotos?: [] }
  const [lightboxState, setLightboxState] = useState(null);

  // Horizontal reel scroll ref
  const reelScrollRef = useRef(null);

  // Fallback demo posts if user hasn't added posts yet
  const samplePosts = useMemo(() => [
    {
      id: "sample_1",
      caption: "☕ Chiều cà phê làm việc tại Không Gian Xanh - Thư giãn cùng cuốn sách yêu thích & lập kế hoạch tài chính quý mới.",
      location: "Quận 1, TP. Hồ Chí Minh",
      createdAt: "2026-08-01T14:30:00Z",
      layoutStyle: "frame",
      category: "life",
      imageUrls: [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
      ],
      likes: 28,
    },
    {
      id: "sample_2",
      caption: "🏔️ Thử thách trekking đỉnh núi đồi thông Đà Lạt - Khoảnh khắc hòa mình vào thiên nhiên và nạp lại năng lượng sáng tạo.",
      location: "Đà Lạt, Lâm Đồng",
      createdAt: "2026-07-20T09:15:00Z",
      layoutStyle: "column",
      category: "travel",
      imageUrls: [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80"
      ],
      likes: 42,
    },
    {
      id: "sample_3",
      caption: "💻 Góc làm việc tối giản với phong cách Setup Desk - Tối ưu hóa hiệu suất làm việc và sáng tạo nội dung.",
      location: "Home Office",
      createdAt: "2026-07-10T18:00:00Z",
      layoutStyle: "frame",
      category: "work",
      imageUrls: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
      ],
      likes: 35,
    },
    {
      id: "sample_4",
      caption: "🥗 Bữa tối tự nấu lành mạnh chuẩn bị cho tuần mới. Tiết kiệm chi phí ăn ngoài và chăm sóc sức khỏe bản thân.",
      location: "Góc Bếp Nhỏ",
      createdAt: "2026-06-28T19:45:00Z",
      layoutStyle: "classic",
      category: "life",
      imageUrls: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
      ],
      likes: 19,
    }
  ], []);

  // Combined posts list: actual user posts if any, else sample posts
  const allPosts = useMemo(() => {
    if (posts && posts.length > 0) return posts;
    return samplePosts;
  }, [posts, samplePosts]);

  // Filtered posts based on tag
  const filteredPosts = useMemo(() => {
    if (selectedTag === "all") return allPosts;
    return allPosts.filter(p => p.category === selectedTag || (selectedTag === "user" && !p.id?.startsWith("sample_")));
  }, [allPosts, selectedTag]);

  // Flatten all photos for continuous gallery lightbox browsing
  const allFlattenedPhotos = useMemo(() => {
    const list = [];
    filteredPosts.forEach(post => {
      let imgs = [];
      if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
        imgs = post.imageUrls.map(convertGoogleDriveUrl);
      } else if (post.imageUrl && post.imageUrl.trim()) {
        imgs = [convertGoogleDriveUrl(post.imageUrl)];
      }

      imgs.forEach(url => {
        list.push({
          url,
          caption: post.caption,
          location: post.location,
          createdAt: post.createdAt,
        });
      });
    });
    return list;
  }, [filteredPosts]);

  // Extract photos from a post object
  const getPostPhotos = (post) => {
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
      return post.imageUrls.map(convertGoogleDriveUrl);
    }
    if (post.imageUrl && post.imageUrl.trim()) {
      return [convertGoogleDriveUrl(post.imageUrl)];
    }
    return [];
  };

  // Open Lightbox at specific photo index
  const openLightboxByGlobalIndex = (index) => {
    if (allFlattenedPhotos.length === 0) return;
    const clamped = Math.max(0, Math.min(index, allFlattenedPhotos.length - 1));
    setLightboxState({
      currentIndex: clamped,
    });
  };

  const openLightboxForPost = (postPhotos, postCaption, photoIndex = 0) => {
    const targetUrl = postPhotos[photoIndex];
    const globalIdx = allFlattenedPhotos.findIndex(item => item.url === targetUrl);
    if (globalIdx !== -1) {
      openLightboxByGlobalIndex(globalIdx);
    } else {
      setLightboxState({
        currentIndex: 0,
        customPhotos: postPhotos.map(url => ({ url, caption: postCaption })),
      });
    }
  };

  // Active photos list for Lightbox navigation
  const currentLightboxPhotos = lightboxState?.customPhotos || allFlattenedPhotos;
  const currentActivePhoto = currentLightboxPhotos[lightboxState?.currentIndex || 0];

  const handleScrollReel = (direction) => {
    if (!reelScrollRef.current) return;
    const scrollAmount = reelScrollRef.current.clientWidth * 0.75;
    reelScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-800 dark:text-stone-100 font-sans pb-20 transition-colors duration-300">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 dark:opacity-20">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-300 dark:bg-emerald-600/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-300 dark:bg-indigo-600/30 rounded-full blur-[120px]" />
      </div>

      {/* TOP STANDALONE PUBLIC NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView("dashboard")}>
          <img src="/app-logo-3d.png" alt="App Logo" className="w-10 h-10 rounded-xl shadow-md object-contain" />
          <div>
            <h1 className="text-base sm:text-lg font-serif font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight flex items-center gap-2">
              {authorName}
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tracking-wide">THƯ VIỆN ẢNH POLAROID KỶ NIỆM</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-colors"
            title="Đổi giao diện Sáng / Tối"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-stone-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("photo-gallery-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors px-3 py-2"
          >
            Ảnh Polaroid
          </button>

          {isGuest ? (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs shadow-sm border border-stone-300/80 dark:border-stone-700 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Đăng Nhập Google</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView("dashboard")}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Vào Ứng Dụng</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* HERO INTRO CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-6 sm:p-12 shadow-sm transition-colors duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10">
            {/* Avatar & Badge */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-xl">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-inner"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              </div>
              <span className="absolute bottom-2 right-2 bg-emerald-800 text-white p-2.5 rounded-full shadow-lg font-bold text-xs flex items-center justify-center border-2 border-white dark:border-stone-900" title="Tài Khoản Đã Xác Thực">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-stone-800 dark:text-stone-100">
                  {authorName}
                </h2>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80">
                  Content Creator & Financial Planner
                </span>
              </div>

              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
                Thư viện khoảnh khắc kỷ niệm & nhật ký ảnh Polaroid cuộc sống. Nơi lưu giữ những hình ảnh trải nghiệm thực tế cùng hành trình quản lý tài chính bền vững.
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-4">
                {/* Button 1: Xem Thư Viện Polaroid */}
                <button
                  onClick={() => {
                    const el = document.getElementById("photo-gallery-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-900/30 border border-emerald-600/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-wide whitespace-nowrap">
                    Xem Thư Viện Polaroid
                  </span>
                  <svg className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Button 2: Đăng Nhập Google / Vào Giao Diện Quản Lý */}
                {isGuest ? (
                  <button
                    onClick={handleGoogleSignIn}
                    className="group relative px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-md hover:shadow-lg border border-stone-300/80 dark:border-stone-700/80 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-4.5 h-4.5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm sm:text-base tracking-wide whitespace-nowrap">
                      Đăng Nhập Google
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className="group relative px-6 py-3.5 rounded-2xl bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700/90 text-stone-800 dark:text-stone-100 shadow-md hover:shadow-lg border border-stone-300/80 dark:border-stone-700/80 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-700/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-4.5 h-4.5 text-stone-700 dark:text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm sm:text-base tracking-wide whitespace-nowrap">
                      Vào Giao Diện Quản Lý
                    </span>
                    <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
              <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">Tổng Số Ảnh Polaroid</span>
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-emerald-800 dark:text-emerald-400 mt-0.5 block">
                {allFlattenedPhotos.length} Bức ảnh
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
              <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">Bài Đăng Khoảnh Khắc</span>
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-teal-700 dark:text-teal-400 mt-0.5 block">
                {allPosts.length} Bài viết
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
              <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">Mục Tiêu Tiết Kiệm</span>
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-indigo-700 dark:text-indigo-400 mt-0.5 block">
                {goals?.length || 0} Mục tiêu
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
              <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">Số Dư Quản Lý</span>
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-amber-700 dark:text-amber-400 mt-0.5 block">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </section>

        {/* AUTHENTIC POLAROID GALLERY SECTION */}
        <section id="photo-gallery-section" className="space-y-6">
          {/* Section Header & View Options */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 block mb-1">
                📸 BỘ SƯU TẬP ẢNH POLAROID KỶ NIỆM
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-800 dark:text-stone-100">
                Thư Viện Ảnh Polaroid Cổ Điển
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Category Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-x-auto max-w-full">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "life", label: "Cuộc sống" },
                  { id: "travel", label: "Du lịch" },
                  { id: "work", label: "Công việc" },
                ].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedTag === tag.id
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                <button
                  onClick={() => setGalleryViewMode("polaroid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    galleryViewMode === "polaroid"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                  title="Chế độ Polaroid Art Wall"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ảnh Polaroid</span>
                </button>

                <button
                  onClick={() => setGalleryViewMode("reel")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    galleryViewMode === "reel"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                  title="Chế độ Reel Lướt Ngang"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Reel Lướt</span>
                </button>

                <button
                  onClick={() => setGalleryViewMode("grid")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    galleryViewMode === "grid"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                  title="Chế độ Lưới Thư Viện"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Lưới Bài Viết</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN MODE: AUTHENTIC POLAROID PHOTO GALLERY WALL */}
          {galleryViewMode === "polaroid" && (
            <div className="p-4 sm:p-8 rounded-3xl bg-stone-200/50 dark:bg-stone-900/60 border border-stone-300/70 dark:border-stone-800/80 backdrop-blur-md shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-2">
                <AnimatePresence mode="popLayout">
                  {allFlattenedPhotos.map((photoItem, gIdx) => {
                    // Vintage tilt angles for Polaroid wall layout
                    const tilts = ["rotate-2", "-rotate-3", "rotate-1", "-rotate-2", "rotate-3", "-rotate-1"];
                    const tiltClass = tilts[gIdx % tilts.length];

                    return (
                      <motion.div
                        key={gIdx}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: gIdx * 0.04 }}
                        onClick={() => openLightboxByGlobalIndex(gIdx)}
                        className={`group/polaroid relative cursor-pointer ${tiltClass} hover:rotate-0 hover:scale-[1.04] hover:z-30 transition-all duration-300`}
                      >
                        {/* Washi Masking Tape Accent at Top Center */}
                        <div className="w-20 h-5 bg-amber-200/70 dark:bg-amber-900/50 backdrop-blur-xs border border-amber-300/60 dark:border-amber-700/50 shadow-xs -mt-3.5 mx-auto rounded-xs opacity-85 group-hover/polaroid:opacity-100 group-hover/polaroid:scale-105 transition-all z-20 relative" />

                        {/* Authentic Polaroid Paper Card Frame */}
                        <div className="p-3.5 pb-8 sm:pb-10 pt-3.5 bg-[#FAF8F5] dark:bg-[#1C1A17] text-stone-900 dark:text-stone-100 rounded-sm border border-stone-300/80 dark:border-stone-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                          {/* Polaroid Square 1:1 Image Container */}
                          <div className="relative aspect-square rounded-xs overflow-hidden bg-stone-950 shadow-inner">
                            <img
                              src={photoItem.url}
                              alt="Polaroid print"
                              className="w-full h-full object-cover group-hover/polaroid:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80";
                              }}
                            />

                            {/* Polaroid Shot Number Tag */}
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs shadow-xs">
                              #{gIdx + 1}
                            </span>
                          </div>

                          {/* Polaroid Extra-Wide Bottom Handwritten Caption Margin */}
                          <div className="pt-4 px-1 space-y-2">
                            <p className="font-serif italic text-xs sm:text-sm text-stone-800 dark:text-stone-200 line-clamp-2 leading-snug font-medium">
                              "{photoItem.caption}"
                            </p>

                            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono tracking-wide">
                              <span className="flex items-center gap-1 font-sans text-emerald-800 dark:text-emerald-400 font-bold">
                                📍 {photoItem.location || "Việt Nam"}
                              </span>
                              <span>
                                {photoItem.createdAt ? new Date(photoItem.createdAt).toLocaleDateString("vi-VN") : "Kỷ niệm"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* MODE 2: REEL / HORIZONTAL SLIDER */}
          {galleryViewMode === "reel" && (
            <div className="relative group">
              <button
                onClick={() => handleScrollReel("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-100 shadow-xl border border-stone-200/80 dark:border-stone-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                aria-label="Cuộn sang trái"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => handleScrollReel("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-100 shadow-xl border border-stone-200/80 dark:border-stone-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                aria-label="Cuộn sang phải"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div
                ref={reelScrollRef}
                className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-stone-200 dark:scrollbar-track-stone-900 scroll-smooth"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {allFlattenedPhotos.map((photoItem, gIdx) => (
                  <motion.div
                    key={gIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => openLightboxByGlobalIndex(gIdx)}
                    className="snap-center shrink-0 w-[280px] sm:w-[360px] rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group/card"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-950">
                      <img
                        src={photoItem.url}
                        alt="Gallery preview"
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80";
                        }}
                      />

                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-black/70 text-white backdrop-blur-md shadow-sm">
                        {gIdx + 1} / {allFlattenedPhotos.length}
                      </span>

                      {photoItem.location && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-stone-900/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 backdrop-blur-md shadow-sm flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {photoItem.location}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 line-clamp-2 leading-relaxed font-light">
                        {photoItem.caption}
                      </p>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                        <span>{photoItem.createdAt ? new Date(photoItem.createdAt).toLocaleDateString("vi-VN") : "Kỷ niệm"}</span>
                        <span className="text-emerald-800 dark:text-emerald-400 font-bold group-hover/card:underline flex items-center gap-1">
                          Phóng to ↗
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 3: POSTS GRID */}
          {galleryViewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, idx) => {
                  const photos = getPostPhotos(post);
                  const hasMultiplePhotos = photos.length > 1;

                  return (
                    <motion.article
                      key={post.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden hover:border-emerald-600/60 transition-all duration-300 shadow-xs hover:shadow-lg flex flex-col justify-between"
                    >
                      {photos.length > 0 && (
                        <div className="relative overflow-hidden bg-stone-100 dark:bg-stone-950 cursor-pointer" onClick={() => openLightboxForPost(photos, post.caption, 0)}>
                          {hasMultiplePhotos ? (
                            <div className="grid grid-cols-2 gap-1.5 p-1.5">
                              {photos.slice(0, 4).map((imgUrl, i) => (
                                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800">
                                  <img
                                    src={imgUrl}
                                    alt={`Post photo ${i+1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
                                    }}
                                  />
                                  {i === 3 && photos.length > 4 && (
                                    <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-lg">
                                      +{photos.length - 4}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="aspect-video sm:aspect-[16/10] overflow-hidden">
                              <img
                                src={photos[0]}
                                alt="Post cover"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80";
                                }}
                              />
                            </div>
                          )}

                          {post.location && (
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-stone-900/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {post.location}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed font-light">
                          {post.caption}
                        </p>

                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                          <div className="flex items-center gap-2">
                            <img src={authorAvatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-emerald-700" />
                            <span className="font-bold text-stone-700 dark:text-stone-300">{authorName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold">
                              <svg className="w-4 h-4 fill-emerald-700 dark:fill-emerald-400" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              {post.likes || 1}
                            </span>
                            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "Mới đăng"}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-800/60 shadow-xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-emerald-400">
              LifeHub - Trợ Lý Sống & Tài Chính Cá Nhân
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Theo dõi số dư tài khoản, tự động tính toán thuế TNCN 7 bậc, định giá phòng trọ và thiết lập mục tiêu tiết kiệm dễ dàng.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setActiveView("dashboard")}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Vào Ứng Dụng Ngay →</span>
            </button>
          </div>
        </section>

        {/* INTERACTIVE LIGHTBOX MODAL WITH FULL CONTINUOUS GALLERY PREV/NEXT CONTROLS */}
        <AnimatePresence>
          {lightboxState && currentActivePhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxState(null)}
              className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
            >
              {/* Top Bar of Lightbox */}
              <div className="flex items-center justify-between text-white shrink-0 pb-2 z-10">
                <div className="flex items-center gap-3">
                  <img src={authorAvatar} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold">{authorName}</h4>
                    <p className="text-[10px] text-stone-400">{currentActivePhoto.location || "Ảnh kỷ niệm"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
                    {(lightboxState.currentIndex || 0) + 1} / {currentLightboxPhotos.length}
                  </span>
                  <button
                    onClick={() => setLightboxState(null)}
                    className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-colors border border-stone-700"
                    aria-label="Đóng"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main Image Display Area with Prev/Next Controls */}
              <div className="relative flex-1 flex items-center justify-center my-auto min-h-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx = (lightboxState.currentIndex - 1 + currentLightboxPhotos.length) % currentLightboxPhotos.length;
                    setLightboxState(prev => ({ ...prev, currentIndex: prevIdx }));
                  }}
                  className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-emerald-800 text-white shadow-2xl border border-stone-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  title="Ảnh trước"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <motion.img
                  key={currentActivePhoto.url}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={currentActivePhoto.url}
                  alt="Full preview"
                  className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-stone-800"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = (lightboxState.currentIndex + 1) % currentLightboxPhotos.length;
                    setLightboxState(prev => ({ ...prev, currentIndex: nextIdx }));
                  }}
                  className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-stone-900/80 hover:bg-emerald-800 text-white shadow-2xl border border-stone-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  title="Ảnh tiếp theo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Bottom Caption & Thumbnail Navigation Strip */}
              <div className="shrink-0 space-y-3 z-10 pt-2" onClick={(e) => e.stopPropagation()}>
                <p className="text-center text-xs sm:text-sm text-stone-200 max-w-2xl mx-auto font-light line-clamp-2">
                  {currentActivePhoto.caption}
                </p>

                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-2xl mx-auto scrollbar-none">
                  {currentLightboxPhotos.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightboxState(prev => ({ ...prev, currentIndex: idx }))}
                      className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        lightboxState.currentIndex === idx
                          ? "border-emerald-500 scale-110 shadow-lg"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={item.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="pt-8 border-t border-stone-200/80 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 space-y-1.5">
          <p>© 2026 {authorName} — Thư Viện Ảnh Polaroid Kỷ Niệm.</p>
          <p className="text-[11px] opacity-75">Thiết kế đồng bộ 100% với giao diện Olive Editorial & Warm Stone.</p>
        </footer>
      </div>
    </div>
  );
};
