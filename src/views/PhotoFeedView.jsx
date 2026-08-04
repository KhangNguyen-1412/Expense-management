import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { convertGoogleDriveUrl } from "../utils/imageUtils";

export const PhotoFeedView = () => {
  const {
    user,
    profile,
    posts = [],
    isLoadingPosts,
    addPost,
    deletePost,
    toggleLikePost,
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
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [postDate, setPostDate] = useState(getTodayString);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const isGuest = !user || user.isAnonymous;
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
      const firstPhotoPost = dayPosts.find((p) => p.imageUrl && p.imageUrl.trim().length > 0);

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

  // Handle image upload from file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast("Dung lượng ảnh tối đa 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
      if (showToast) showToast("Đã chọn ảnh thành công!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!caption.trim() && !imageUrl.trim()) {
      if (showToast) showToast("Vui lòng nhập nội dung hoặc chọn ảnh để đăng bài", "error");
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const selectedDateStr = postDate || getTodayString();
    const customCreatedAt = new Date(`${selectedDateStr}T${timeStr}`).toISOString();

    addPost({
      caption: caption.trim(),
      imageUrl: convertGoogleDriveUrl(imageUrl),
      location: location.trim(),
      createdAt: customCreatedAt,
      authorName,
      authorAvatar,
    });

    setCaption("");
    setImageUrl("");
    setLocation("");
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
          {driveFolderUrl ? (
            <a
              href={driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/40 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-1.5"
              title="Mở Folder Google Drive đã liên kết"
            >
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Kho Google Drive</span>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <button
              onClick={() => setActiveView("settings")}
              className="px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300/40 rounded-xl hover:bg-amber-200 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Liên kết Google Drive</span>
            </button>
          )}

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
              {authorName} ơi, bạn đang nghĩ gì? Dán link Google Drive hoặc chọn ảnh...
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
            const finalPhotoUrl = convertGoogleDriveUrl(post.imageUrl);
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
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{formatDate(post.createdAt)}</span>
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

                {/* Post Image */}
                {finalPhotoUrl && (
                  <div
                    onClick={() => setPreviewPhoto({ title: post.caption || "Ảnh bài viết", url: finalPhotoUrl })}
                    className="relative cursor-pointer bg-slate-950 flex items-center justify-center overflow-hidden max-h-[500px]"
                  >
                    <img
                      src={finalPhotoUrl}
                      alt="Post visual"
                      className="w-full h-auto object-contain max-h-[500px] hover:scale-[1.01] transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/600x400?text=L%E1%BB%97i+t%E1%BA%A3i+%E1%BA%A3nh+Google+Drive";
                      }}
                    />
                  </div>
                )}

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
                    const firstPhotoUrl = item.firstPhotoPost
                      ? convertGoogleDriveUrl(item.firstPhotoPost.imageUrl)
                      : null;
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
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
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
              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
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
                    placeholder="Ví dụ: Hồ Hoàn Kiếm, Hà Nội hoặc Quán cà phê Chill..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {location.trim() && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                      Tiêu đề bài đăng: <b>{authorName} đang ở {location}</b>
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

                {/* Photo Input (Google Drive Link / Upload) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Hình ảnh bài viết</span>
                    </label>

                    {driveFolderUrl && (
                      <a
                        href={driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Mở Kho Google Drive</span>
                      </a>
                    )}
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán Link Google Drive hoặc Link ảnh trực tiếp..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Hoặc tải ảnh từ thiết bị</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                      <img
                        src={convertGoogleDriveUrl(imageUrl)}
                        alt="Preview"
                        className="max-h-48 w-auto object-contain"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x150?text=L%E1%BB%97i+link+anh";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md transition-all"
                  >
                    Đăng bài viết
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-md">
                  {previewPhoto.title}
                </span>
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-slate-950 min-h-[300px]">
                <img
                  src={convertGoogleDriveUrl(previewPhoto.url)}
                  alt={previewPhoto.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
