import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { convertGoogleDriveUrl, compressImage } from "../utils/imageUtils";

export const PhotoFeedView = () => {
  const {
    user,
    profile,
    posts = [],
    isLoadingPosts,
    addPost,
    deletePost,
    toggleLikePost,
    updatePostLayout,
    driveFolderUrl,
    setActiveView,
    showToast,
  } = useAppContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);

  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [caption, setCaption] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [location, setLocation] = useState("");
  const [postDate, setPostDate] = useState(getTodayString);
  const [layoutStyle, setLayoutStyle] = useState("frame"); // "frame" (Khung/Lưới), "column" (Cột), "classic" (Cổ điển)

  // Lightbox modal state: { photos: [], currentIndex: 0, title: "" }
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Fallback to default Google Drive if no folder link configured yet
  const targetDriveUrl = driveFolderUrl && driveFolderUrl.trim() ? driveFolderUrl.trim() : "https://drive.google.com/drive/u/0/folders/1RuplhVRJ4cFtvjBAHkCgntAV98v5QLEp";
  const authorName = profile?.fullName || user?.displayName || (isGuest ? "Khách Vô Danh" : "Thành viên");
  const authorAvatar = profile?.avatarUrl || user?.photoURL || "https://via.placeholder.com/100";

  // Group posts by date string (YYYY-MM-DD)
  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach((post) => {
      if (!post.createdAt) return;
      const dateKey = post.createdAt.split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(post);
    });
    return map;
  }, [posts]);

  // Filter posts if a specific date is selected
  const displayedPosts = useMemo(() => {
    if (!selectedFilterDate) return posts;
    return posts.filter((p) => p.createdAt && p.createdAt.startsWith(selectedFilterDate));
  }, [posts, selectedFilterDate]);

  // Helper: Extract all photo URLs from a post
  const getPostPhotos = (post) => {
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
      return post.imageUrls.map(convertGoogleDriveUrl);
    }
    if (post.imageUrl && post.imageUrl.trim()) {
      return [convertGoogleDriveUrl(post.imageUrl)];
    }
    return [];
  };

  // Open Lightbox at specific index
  const openLightbox = (photos, index = 0, title = "") => {
    setPreviewPhoto({
      photos,
      currentIndex: index,
      title: title || "Hình ảnh bài viết",
    });
  };

  // Calculate calendar grid for current month/year
  const calendarData = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    // Monday = 0, Sunday = 6
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const todayStr = new Date().toISOString().split("T")[0];

    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const dayPosts = postsByDate[dateKey] || [];
      const firstPhotoPost = dayPosts.find((p) => {
        const photos = getPostPhotos(p);
        return photos.length > 0;
      });

      days.push({
        day,
        dateKey,
        dayPosts,
        firstPhotoPost,
        isToday: dateKey === todayStr,
      });
    }
    return { year, month, days };
  }, [calendarViewDate, postsByDate]);

  // Month navigation
  const prevMonth = () => {
    setCalendarViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    setCalendarViewDate(new Date());
  };

  // Add a photo URL to draft post
  const handleAddUrlPhoto = () => {
    if (!newUrlInput.trim()) return;
    const converted = convertGoogleDriveUrl(newUrlInput.trim());
    setImageUrls((prev) => [...prev, converted]);
    setNewUrlInput("");
    if (showToast) showToast("Đã thêm ảnh vào bài đăng!", "success");
  };

  // Handle image upload from multiple files with auto-compression
  const handleMultipleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (showToast) showToast("Đang tối ưu và nén dung lượng ảnh...", "info");

    let count = 0;
    for (const file of files) {
      try {
        const compressedDataUrl = await compressImage(file, 1000, 0.7);
        setImageUrls((prev) => [...prev, compressedDataUrl]);
        count++;
      } catch (err) {
        console.error("Lỗi khi nén ảnh:", err);
      }
    }

    if (count > 0 && showToast) {
      showToast(`Đã tối ưu và thêm ${count} ảnh thành công!`, "success");
    }
  };

  // Remove photo from draft post
  const handleRemoveDraftPhoto = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!caption.trim() && imageUrls.length === 0) {
      if (showToast) showToast("Vui lòng nhập nội dung hoặc thêm ít nhất 1 ảnh để đăng bài", "error");
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const selectedDateStr = postDate || getTodayString();
    const customCreatedAt = new Date(`${selectedDateStr}T${timeStr}`).toISOString();

    addPost({
      caption: caption.trim(),
      imageUrls: imageUrls,
      location: location.trim(),
      layoutStyle: layoutStyle,
      createdAt: customCreatedAt,
      authorName,
      authorAvatar,
    });

    setCaption("");
    setImageUrls([]);
    setNewUrlInput("");
    setLocation("");
    setLayoutStyle("frame");
    setPostDate(getTodayString());
    setIsCreateOpen(false);
    if (showToast) showToast("Đã đăng bài viết mới thành công!", "success");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatFilterDateTitle = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Render photo gallery for a post in feed based on layoutStyle: 'frame' | 'column' | 'classic'
  const renderPostPhotosGrid = (post) => {
    const photos = getPostPhotos(post);
    if (photos.length === 0) return null;

    const style = post.layoutStyle || "frame";

    // 1. Dạng Cột (Triển Lãm Tranh Nghệ Thuật - Museum Art Gallery Exhibition Layout)
    if (style === "column") {
      const isGrid = photos.length <= 3;
      return (
        <div className="relative bg-neutral-950 p-4 sm:p-6 border-t border-b border-neutral-800/80 overflow-hidden rounded-b-2xl">
          {/* Museum Overhead Spotlight Glow */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-amber-400/15 via-amber-400/5 to-transparent pointer-events-none" />

          <div
            className={
              isGrid
                ? `grid gap-6 ${
                    photos.length === 1
                      ? "grid-cols-1 max-w-lg mx-auto"
                      : photos.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  }`
                : "flex flex-row gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-600/40 snap-x snap-mandatory"
            }
          >
            {photos.map((url, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(photos, idx, post.caption)}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 ${
                  !isGrid ? "shrink-0 w-64 sm:w-80 snap-center" : "w-full"
                }`}
              >
                {/* Museum Framed Artwork Container */}
                <div className="bg-stone-900 border-[6px] border-amber-900/60 dark:border-stone-800 p-3 sm:p-4 rounded-lg shadow-2xl shadow-black/80 flex flex-col items-center">
                  {/* Inner Picture Matting (Pass-partout) */}
                  <div className="w-full bg-stone-100 dark:bg-stone-950 p-2 sm:p-3 rounded-xs border border-stone-300 dark:border-stone-800 shadow-inner flex items-center justify-center min-h-[220px] max-h-[360px]">
                    <img
                      src={url}
                      alt={`Artwork ${idx + 1}`}
                      className="w-full h-auto object-contain max-h-[340px] shadow-sm group-hover:scale-[1.02] transition-transform duration-300 rounded-xs"
                    />
                  </div>

                  {/* Brass Museum Plaque Tag */}
                  <div className="mt-3 px-3 py-1 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 text-stone-900 rounded border border-amber-400/80 shadow-md font-serif text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                    <span className="text-[8px] opacity-70">✦</span>
                    <span>TÁC PHẨM #{idx + 1}</span>
                    <span className="text-[8px] opacity-70">✦</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. Dạng Cổ điển (Vintage Polaroid Layout)
    if (style === "classic") {
      return (
        <div className="p-4 sm:p-6 bg-gradient-to-b from-amber-50/50 to-orange-50/30 dark:from-slate-950/90 dark:to-slate-900/80 border-t border-b border-amber-200/40 dark:border-slate-800">
          <div className={`grid gap-6 ${photos.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
            {photos.map((url, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(photos, idx, post.caption)}
                className={`bg-white dark:bg-slate-900 p-3 pt-4 pb-6 rounded-xl shadow-lg hover:shadow-2xl border border-slate-200/90 dark:border-slate-800 cursor-pointer transform ${
                  idx % 2 === 0 ? "-rotate-1 hover:rotate-0" : "rotate-1 hover:rotate-0"
                } transition-all duration-300 relative group`}
              >
                {/* Washi Tape Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-200/80 dark:bg-amber-700/50 backdrop-blur-xs rotate-2 shadow-xs rounded-xs border border-amber-300/40 pointer-events-none z-10" />

                <div className="overflow-hidden rounded-md bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                  <img
                    src={url}
                    alt={`Classic photo ${idx + 1}`}
                    className="w-full h-auto block sepia-[0.08] contrast-[1.02] group-hover:scale-[1.02] transition-transform duration-300 rounded-md"
                  />
                </div>
                <div className="mt-3 text-center text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                  ✦ KỶ NIỆM #{idx + 1} ✦
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Dạng Khung / Lưới (Modern Facebook Grid Layout)
    if (photos.length === 1) {
      return (
        <div
          onClick={() => openLightbox(photos, 0, post.caption)}
          className="relative cursor-pointer bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden"
        >
          <img
            src={photos[0]}
            alt="Post visual"
            className="w-full h-auto block hover:scale-[1.01] transition-transform duration-300"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/600x400?text=L%E1%BB%97i+t%E1%BA%A3nh";
            }}
          />
        </div>
      );
    }

    if (photos.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-950 overflow-hidden">
          {photos.map((url, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(photos, idx, post.caption)}
              className="relative h-64 sm:h-96 overflow-hidden bg-slate-900 group cursor-pointer"
            >
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }

    if (photos.length === 3) {
      return (
        <div className="grid grid-cols-3 gap-1 bg-slate-200 dark:bg-slate-950 overflow-hidden">
          <div
            onClick={() => openLightbox(photos, 0, post.caption)}
            className="col-span-2 h-64 sm:h-96 overflow-hidden bg-slate-900 group relative cursor-pointer"
          >
            <img
              src={photos[0]}
              alt="Photo 1"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-64 sm:h-96">
            {photos.slice(1, 3).map((url, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(photos, idx + 1, post.caption)}
                className="relative overflow-hidden bg-slate-900 group cursor-pointer"
              >
                <img
                  src={url}
                  alt={`Photo ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4 or more photos (Facebook 2x2 grid layout)
    const displayPhotos = photos.slice(0, 4);
    const extraCount = photos.length - 4;

    return (
      <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-950 overflow-hidden">
        {displayPhotos.map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(photos, idx, post.caption)}
            className="relative h-48 sm:h-72 overflow-hidden bg-slate-900 group cursor-pointer"
          >
            <img
              src={url}
              alt={`Photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {idx === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-2xl group-hover:bg-slate-950/65 transition-colors">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="page-title flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span>Nhật ký Ảnh & Dòng thời gian</span>
          </h2>
          <p className="page-subtitle">
            Ghi lại cảm nghĩ, khoảnh khắc và bài viết liên kết với kho Google Drive
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={targetDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/40 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="Mở Kho Google Drive"
          >
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Kho Google Drive</span>
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo bài đăng</span>
          </button>
        </div>
      </div>

      {/* Social Feed Container */}
      <div className="space-y-6">
        {/* Create Post Prompt Bar */}
        <div className="page-card p-4 flex flex-col sm:flex-row items-center gap-3 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 cursor-pointer" onClick={() => setIsCreateOpen(true)}>
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/100";
              }}
            />
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-400 font-medium">
              {authorName} ơi, bạn đang nghĩ gì? Dán link Google Drive hoặc chọn nhiều ảnh...
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            {/* Calendar Button (Icon Lịch) */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Xem Lịch nhật ký ảnh theo tháng"
            >
              <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Lịch nhật ký</span>
            </button>

            {/* Post Photo Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Đăng ảnh</span>
            </button>
          </div>
        </div>

        {/* Date Filter Active Banner */}
        {selectedFilterDate && (
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Đang hiển thị nhật ký bài viết ngày: <b>{formatFilterDateTitle(selectedFilterDate)}</b> ({displayedPosts.length} bài)</span>
            </div>
            <button
              onClick={() => setSelectedFilterDate(null)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Xóa lọc (Xem tất cả)</span>
              <span>✕</span>
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoadingPosts && (
          <div className="text-center py-8 text-xs text-slate-400">
            Đang tải nhật ký bài viết...
          </div>
        )}

        {/* Feed Posts List */}
        {!isLoadingPosts && displayedPosts.length > 0 ? (
          displayedPosts.map((post) => {
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="page-card overflow-hidden"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar || authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-indigo-500/20"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100";
                      }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 flex-wrap">
                        <span>{post.authorName || authorName}</span>
                        {post.location && (
                          <>
                            <span className="font-normal text-slate-500 dark:text-slate-400">đang ở</span>
                            <a
                              href={
                                post.location.startsWith("http")
                                  ? post.location
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location)}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                              title="Mở vị trí trên Google Maps"
                            >
                              <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{post.location}</span>
                            </a>
                          </>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        {/* Interactive Layout Switcher Badge */}
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => updatePostLayout(post.id, "frame")}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                              (post.layoutStyle || "frame") === "frame"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                            title="Đổi dạng Khung / Lưới"
                          >
                            Khung
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePostLayout(post.id, "column")}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                              post.layoutStyle === "column"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                            title="Đổi dạng Cột"
                          >
                            Cột
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePostLayout(post.id, "classic")}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold transition-all ${
                              post.layoutStyle === "classic"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                            title="Đổi dạng Cổ điển"
                          >
                            Cổ điển
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
                        deletePost(post.id);
                        if (showToast) showToast("Đã xóa bài viết", "info");
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Xóa bài viết"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Post Caption */}
                {post.caption && (
                  <div className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {post.caption}
                  </div>
                )}

                {/* Multi-Photo Grid / Layout Renderer */}
                {renderPostPhotosGrid(post)}

                {/* Post Footer Actions */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        post.isLiked
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          post.isLiked ? "text-rose-500 fill-rose-500" : "text-slate-400"
                        }`}
                        fill={post.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likesCount || 0} Thích</span>
                    </button>

                    {driveFolderUrl && (
                      <a
                        href={driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-slate-400 hover:text-indigo-500 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Google Drive</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      if (showToast) showToast("Đã sao chép liên kết trang!", "success");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          !isLoadingPosts && (
            <div className="page-card p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {selectedFilterDate ? `Không có bài viết ngày ${formatFilterDateTitle(selectedFilterDate)}` : "Chưa có bài viết nhật ký nào"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {selectedFilterDate ? "Thử chọn ngày khác trên lịch hoặc bấm 'Xóa lọc' để xem toàn bộ bài đăng." : "Hãy bấm nút '+ Tạo bài đăng' để lưu giữ khoảnh khắc đầu tiên của bạn kết nối cùng kho Google Drive."}
                </p>
              </div>
              {selectedFilterDate ? (
                <button
                  onClick={() => setSelectedFilterDate(null)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs rounded-xl transition-all"
                >
                  Xem tất cả ngày
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Đăng khoảnh khắc đầu tiên</span>
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Calendar Modal (Lịch Nhật Ký Ảnh) */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Lịch nhật ký hình ảnh
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Xem ảnh đầu tiên đại diện cho từng ngày
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  ✕
                </button>
              </div>

              {/* Month Navigation */}
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
                    title="Tháng trước"
                  >
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 px-1">
                    Tháng {calendarData.month + 1}, {calendarData.year}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
                    title="Tháng sau"
                  >
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={resetToToday}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Hôm nay
                </button>
              </div>

              {/* Calendar Grid Body */}
              <div className="p-4">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => (
                    <span
                      key={dayName}
                      className={`text-[11px] font-bold py-1 ${
                        idx >= 5 ? "text-rose-500 dark:text-rose-400" : "text-slate-400"
                      }`}
                    >
                      {dayName}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarData.days.map((item, idx) => {
                    if (!item) {
                      return <div key={`empty_${idx}`} className="h-14" />;
                    }

                    const hasPosts = item.dayPosts.length > 0;
                    const photos = item.firstPhotoPost ? getPostPhotos(item.firstPhotoPost) : [];
                    const firstPhotoUrl = photos.length > 0 ? photos[0] : null;
                    const isSelected = selectedFilterDate === item.dateKey;

                    return (
                      <div
                        key={item.dateKey}
                        onClick={() => {
                          if (hasPosts) {
                            setSelectedFilterDate(item.dateKey);
                            setIsCalendarOpen(false);
                            if (showToast) showToast(`Đang lọc nhật ký ngày ${formatFilterDateTitle(item.dateKey)}`, "info");
                          }
                        }}
                        className={`h-14 rounded-2xl p-1 flex flex-col items-center justify-between relative transition-all ${
                          hasPosts
                            ? "cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            : "opacity-60"
                        } ${
                          isSelected
                            ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/60"
                            : ""
                        } ${
                          item.isToday && !isSelected
                            ? "border border-indigo-500/50 bg-slate-50 dark:bg-slate-800/40"
                            : ""
                        }`}
                        title={
                          hasPosts
                            ? `${formatFilterDateTitle(item.dateKey)}: ${item.dayPosts.length} bài viết`
                            : `Ngày ${formatFilterDateTitle(item.dateKey)} (Chưa có bài)`
                        }
                      >
                        {/* Day Number */}
                        <span
                          className={`text-[11px] font-bold leading-none ${
                            item.isToday
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {item.day}
                        </span>

                        {/* Thumbnail / Photo Frame */}
                        <div className="w-8 h-8 flex items-center justify-center">
                          {firstPhotoUrl ? (
                            <div className="relative group">
                              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 overflow-hidden shadow-sm hover:scale-110 transition-transform">
                                <img
                                  src={firstPhotoUrl}
                                  alt={`Post ${item.day}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/50?text=Error";
                                  }}
                                />
                              </div>
                              {item.dayPosts.length > 1 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                                  {item.dayPosts.length}
                                </span>
                              )}
                            </div>
                          ) : hasPosts ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 opacity-40" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">💡 Click vào ngày có ảnh tròn để xem bài viết ngày đó</span>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="px-3 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg md:max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-4 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-9 h-9 rounded-full object-cover border border-indigo-500/30"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Tạo bài viết mới
                    </h3>
                    <span className="text-[10px] text-slate-400 block">Đăng bởi {authorName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreatePost} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 2-Column Responsive Layout on Laptop (md:grid-cols-2), Vertical Stack on Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Post Details & Settings */}
                  <div className="space-y-4">
                    {/* Caption input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Cảm nghĩ / Nội dung bài viết</span>
                      </label>
                      <textarea
                        rows={4}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Viết cảm nghĩ, nhật ký khoảnh khắc hôm nay..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Location Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Địa điểm / Vị trí Google Maps</span>
                        </label>

                        <a
                          href={
                            location.trim()
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
                              : "https://www.google.com/maps"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Mở Google Maps</span>
                        </a>
                      </div>

                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ví dụ: Hồ Hoàn Kiếm, Hà Nội..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {location.trim() && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                          Tiêu đề: <b>{authorName} đang ở {location}</b>
                        </p>
                      )}
                    </div>

                    {/* Memory Date Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Ngày của kỷ niệm / Ngày đăng bài</span>
                      </label>
                      <input
                        type="date"
                        value={postDate}
                        onChange={(e) => setPostDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Layout Format Style Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span>Dạng hiển thị bố cục ảnh</span>
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setLayoutStyle("frame")}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            layoutStyle === "frame"
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="text-[11px]">Khung / Lưới</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLayoutStyle("column")}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            layoutStyle === "column"
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span className="text-[11px]">Dạng Cột</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLayoutStyle("classic")}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            layoutStyle === "classic"
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-[11px]">Cổ điển</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Google Drive & Photo Upload Section */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Hình ảnh bài viết Google Drive (Đã chọn {imageUrls.length} ảnh)</span>
                        </label>

                        <a
                          href={targetDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span>Mở Kho Google Drive</span>
                        </a>
                      </div>

                      {/* Google Drive Guide Box */}
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                        <div className="font-bold flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Cách lưu ảnh trên Google Drive:</span>
                        </div>
                        <ol className="list-decimal list-inside text-[11px] space-y-0.5 opacity-90 pl-1 leading-relaxed">
                          <li>Bấm <b>"Mở Kho Google Drive"</b> ở trên để xem kho ảnh.</li>
                          <li>Tải ảnh lên Google Drive ➔ Bấm <b>Chia sẻ</b> ➔ Chọn <i>'Bất kỳ ai có liên kết'</i>.</li>
                          <li><b>Sao chép liên kết</b> và Dán vào ô bên dưới ➔ Bấm <b>+ Thêm ảnh</b>.</li>
                        </ol>
                      </div>

                      {/* Add URL field + button */}
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={newUrlInput}
                          onChange={(e) => setNewUrlInput(e.target.value)}
                          placeholder="Dán Link Google Drive (hoặc Link ảnh trực tiếp)..."
                          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrlPhoto}
                          className="px-3.5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shrink-0 shadow-sm"
                        >
                          + Thêm ảnh
                        </button>
                      </div>

                      {/* Upload multiple files */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Hoặc chọn nhiều ảnh từ thiết bị</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleMultipleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Preview Selected Photos list grid */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-2 max-h-40 overflow-y-auto pr-1">
                        {imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 h-20 flex items-center justify-center shadow-xs"
                          >
                            <img
                              src={convertGoogleDriveUrl(url)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/150?text=L%E1%BB%97i+anh";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftPhoto(idx)}
                              className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md opacity-90 hover:opacity-100 transition-opacity"
                              title="Xóa ảnh này"
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md transition-all"
                  >
                    Đăng bài viết
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Carousel Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/60">
                <span className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-md">
                  {previewPhoto.title}
                </span>

                <div className="flex items-center gap-4">
                  {previewPhoto.photos && previewPhoto.photos.length > 1 && (
                    <span className="text-xs font-bold text-slate-400">
                      {previewPhoto.currentIndex + 1} / {previewPhoto.photos.length}
                    </span>
                  )}
                  <button
                    onClick={() => setPreviewPhoto(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Image Viewer */}
              <div className="relative p-2 flex items-center justify-center bg-slate-950 min-h-[350px] sm:min-h-[500px]">
                {/* Previous Button */}
                {previewPhoto.photos && previewPhoto.photos.length > 1 && previewPhoto.currentIndex > 0 && (
                  <button
                    onClick={() =>
                      setPreviewPhoto((prev) => ({
                        ...prev,
                        currentIndex: prev.currentIndex - 1,
                      }))
                    }
                    className="absolute left-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 text-white font-bold flex items-center justify-center border border-slate-700 shadow-lg hover:bg-slate-800 transition-all text-xl"
                  >
                    ‹
                  </button>
                )}

                <img
                  src={
                    previewPhoto.photos
                      ? previewPhoto.photos[previewPhoto.currentIndex]
                      : previewPhoto.url
                  }
                  alt={previewPhoto.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=L%E1%BB%97i+t%E1%BA%A3i+anh";
                  }}
                />

                {/* Next Button */}
                {previewPhoto.photos &&
                  previewPhoto.photos.length > 1 &&
                  previewPhoto.currentIndex < previewPhoto.photos.length - 1 && (
                    <button
                      onClick={() =>
                        setPreviewPhoto((prev) => ({
                          ...prev,
                          currentIndex: prev.currentIndex + 1,
                        }))
                      }
                      className="absolute right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 text-white font-bold flex items-center justify-center border border-slate-700 shadow-lg hover:bg-slate-800 transition-all text-xl"
                    >
                      ›
                    </button>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
