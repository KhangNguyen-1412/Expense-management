import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import administrativeUnits from "../data/administrativeUnits.json";
import { convertGoogleDriveUrl } from "../utils/imageUtils";

export const EditProfileDialog = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  showToast,
}) => {
  const provinces = useMemo(() => {
    return Object.values(administrativeUnits);
  }, []);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [avatarType, setAvatarType] = useState("url"); // 'url' or 'file'
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Collections for photos
  const [personalPhotos, setPersonalPhotos] = useState([]);
  const [itemPhotos, setItemPhotos] = useState([]);

  // Inputs for new personal photo
  const [newPersonalTitle, setNewPersonalTitle] = useState("");
  const [newPersonalUrl, setNewPersonalUrl] = useState("");

  // Inputs for new item photo
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");

  // Permanent Address
  const [permProvince, setPermProvince] = useState("");
  const [permWard, setPermWard] = useState("");
  const [permStreet, setPermStreet] = useState("");

  // Temporary Address
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [tempProvince, setTempProvince] = useState("");
  const [tempWard, setTempWard] = useState("");
  const [tempStreet, setTempStreet] = useState("");

  // Initialize form from current profile
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFullName(currentProfile.fullName || "");
      setDob(currentProfile.dob || "");
      setPhoneNumber(currentProfile.phoneNumber || "");
      setIdCardNumber(currentProfile.idCardNumber || "");
      setAvatarUrl(currentProfile.avatarUrl || "");
      setPersonalPhotos(currentProfile.personalPhotos || []);
      setItemPhotos(currentProfile.itemPhotos || []);
      setAvatarType("url");

      const perm = currentProfile.permanentAddress || {};
      setPermProvince(perm.provinceCode || "");
      setPermWard(perm.wardCode || "");
      setPermStreet(perm.streetDetail || "");

      const temp = currentProfile.temporaryAddress || {};
      setIsSameAddress(!!temp.isSameAsPermanent);
      setTempProvince(temp.provinceCode || "");
      setTempWard(temp.wardCode || "");
      setTempStreet(temp.streetDetail || "");
    }
  }, [isOpen, currentProfile]);

  // Dynamic Wards based on selected Province
  const permWards = useMemo(() => {
    if (!permProvince || !administrativeUnits[permProvince]) return [];
    return administrativeUnits[permProvince].wards || [];
  }, [permProvince]);

  const tempWards = useMemo(() => {
    if (!tempProvince || !administrativeUnits[tempProvince]) return [];
    return administrativeUnits[tempProvince].wards || [];
  }, [tempProvince]);

  // Sync Temporary address if isSameAddress is checked
  useEffect(() => {
    if (isSameAddress) {
      setTempProvince(permProvince);
      setTempWard(permWard);
      setTempStreet(permStreet);
    }
  }, [isSameAddress, permProvince, permWard, permStreet]);

  // Handle Avatar file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast("Dung lượng ảnh tối đa 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      if (showToast) showToast("Đã tải ảnh lên thành công!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Date format helpers (YYYY-MM-DD <-> DD/MM/YYYY)
  const isoToDdMmYyyy = (isoStr) => {
    if (!isoStr) return "";
    if (isoStr.includes("/")) return isoStr;
    const parts = isoStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  const ddMmYyyyToIso = (dmYStr) => {
    if (!dmYStr) return "";
    if (dmYStr.includes("-")) return dmYStr;
    const parts = dmYStr.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return "";
  };

  // Helper to construct full formatted address
  const buildFullAddress = (street, wardCode, provinceCode) => {
    const parts = [];
    if (street && street.trim()) parts.push(street.trim());

    if (provinceCode && administrativeUnits[provinceCode]) {
      const p = administrativeUnits[provinceCode];
      if (wardCode) {
        const w = p.wards.find((item) => item.code === wardCode);
        if (w) parts.push(w.name);
      }
      parts.push(p.name);
    }
    return parts.join(", ");
  };

  // Handle adding personal photo
  const handleAddPersonalPhoto = (urlOverride = null) => {
    const rawUrl = urlOverride || newPersonalUrl;
    if (!rawUrl || !rawUrl.trim()) {
      if (showToast) showToast("Vui lòng dán link hoặc chọn file ảnh", "error");
      return;
    }
    const finalUrl = convertGoogleDriveUrl(rawUrl);
    const newPhoto = {
      id: Date.now().toString(),
      title: newPersonalTitle.trim() || "Ảnh bản thân",
      url: finalUrl,
      createdAt: new Date().toISOString(),
    };
    setPersonalPhotos((prev) => [...prev, newPhoto]);
    setNewPersonalTitle("");
    setNewPersonalUrl("");
    if (showToast) showToast("Đã thêm hình ảnh bản thân!", "success");
  };

  // Handle adding item photo
  const handleAddItemPhoto = (urlOverride = null) => {
    const rawUrl = urlOverride || newItemUrl;
    if (!rawUrl || !rawUrl.trim()) {
      if (showToast) showToast("Vui lòng dán link hoặc chọn file ảnh", "error");
      return;
    }
    const finalUrl = convertGoogleDriveUrl(rawUrl);
    const newPhoto = {
      id: Date.now().toString(),
      title: newItemTitle.trim() || "Ảnh đồ dùng",
      url: finalUrl,
      createdAt: new Date().toISOString(),
    };
    setItemPhotos((prev) => [...prev, newPhoto]);
    setNewItemTitle("");
    setNewItemUrl("");
    if (showToast) showToast("Đã thêm hình ảnh đồ dùng!", "success");
  };

  const handleRemovePersonalPhoto = (id) => {
    setPersonalPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemoveItemPhoto = (id) => {
    setItemPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      if (showToast) showToast("Vui lòng nhập họ và tên", "error");
      return;
    }

    const updatedPermProvince = permProvince;
    const updatedPermWard = permWard;
    const updatedPermStreet = permStreet;

    const finalTempProvince = isSameAddress ? permProvince : tempProvince;
    const finalTempWard = isSameAddress ? permWard : tempWard;
    const finalTempStreet = isSameAddress ? permStreet : tempStreet;

    const updatedProfile = {
      fullName: fullName.trim(),
      dob: dob,
      phoneNumber: phoneNumber.trim(),
      idCardNumber: idCardNumber.trim(),
      avatarUrl: convertGoogleDriveUrl(avatarUrl),
      permanentAddress: {
        provinceCode: updatedPermProvince,
        wardCode: updatedPermWard,
        streetDetail: updatedPermStreet.trim(),
        fullAddress: buildFullAddress(updatedPermStreet, updatedPermWard, updatedPermProvince),
      },
      temporaryAddress: {
        isSameAsPermanent: isSameAddress,
        provinceCode: finalTempProvince,
        wardCode: finalTempWard,
        streetDetail: finalTempStreet.trim(),
        fullAddress: buildFullAddress(finalTempStreet, finalTempWard, finalTempProvince),
      },
    };

    onSave(updatedProfile);
    if (showToast) showToast("Cập nhật thông tin cá nhân thành công!", "success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Dialog Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Cập nhật thông tin cá nhân
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Địa chỉ sử dụng đơn vị hành chính sau sáp nhập
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Dialog Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* General Info Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>1. Thông tin chung</span>
              </h4>

              {/* Avatar section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border-2 border-indigo-500/30">
                  <img
                    src={avatarUrl || "https://via.placeholder.com/100"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ảnh đại diện (Avatar)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAvatarType("url")}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        avatarType === "url"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Dán Link ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarType("file")}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        avatarType === "file"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Tải từ máy
                    </button>
                  </div>

                  {avatarType === "url" ? (
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Date of birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày sinh (dd/mm/yyyy)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="dd/mm/yyyy (Ví dụ: 15/08/1995)"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-9"
                    />
                    <input
                      type="date"
                      value={ddMmYyyyToIso(dob)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setDob(isoToDdMmYyyy(e.target.value));
                        }
                      }}
                      className="absolute right-2 opacity-50 hover:opacity-100 w-5 h-5 cursor-pointer border-0 bg-transparent shrink-0"
                      title="Chọn từ lịch"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Citizen ID (CCCD) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số CCCD / Căn cước công dân
                  </label>
                  <input
                    type="text"
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value)}
                    placeholder="Ví dụ: 001098765432"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Permanent Address Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>2. Địa chỉ thường trú (Sau sáp nhập)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tỉnh / Thành phố */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    value={permProvince}
                    onChange={(e) => {
                      setPermProvince(e.target.value);
                      setPermWard("");
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Chọn Tỉnh / Thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Xã / Phường */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Xã / Phường / Thị trấn
                  </label>
                  <select
                    disabled={!permProvince}
                    value={permWard}
                    onChange={(e) => setPermWard(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">-- Chọn Xã / Phường --</option>
                    {permWards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Số nhà / Tên đường */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số nhà / Tên đường / Thôn xóm
                </label>
                <input
                  type="text"
                  value={permStreet}
                  onChange={(e) => setPermStreet(e.target.value)}
                  placeholder="Ví dụ: Số 123 Đường Nguyễn Trãi"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preview Address String */}
              {(permStreet || permWard || permProvince) && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="font-semibold">Địa chỉ hoàn chỉnh: </span>
                  {buildFullAddress(permStreet, permWard, permProvince) || "Chưa hoàn tất"}
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Temporary Address Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <span>3. Địa chỉ tạm trú (Sau sáp nhập)</span>
                </h4>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSameAddress}
                    onChange={(e) => setIsSameAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>Giống địa chỉ thường trú</span>
                </label>
              </div>

              {!isSameAddress && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tỉnh / Thành phố */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tỉnh / Thành phố
                      </label>
                      <select
                        value={tempProvince}
                        onChange={(e) => {
                          setTempProvince(e.target.value);
                          setTempWard("");
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Chọn Tỉnh / Thành phố --</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Xã / Phường */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Xã / Phường / Thị trấn
                      </label>
                      <select
                        disabled={!tempProvince}
                        value={tempWard}
                        onChange={(e) => setTempWard(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <option value="">-- Chọn Xã / Phường --</option>
                        {tempWards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name} ({w.level})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Số nhà / Tên đường */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số nhà / Tên đường / Thôn xóm
                    </label>
                    <input
                      type="text"
                      value={tempStreet}
                      onChange={(e) => setTempStreet(e.target.value)}
                      placeholder="Ví dụ: Số 456 Đường Phạm Văn Đồng"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Preview Address String */}
                  {(tempStreet || tempWard || tempProvince) && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                      <span className="font-semibold">Địa chỉ hoàn chỉnh: </span>
                      {buildFullAddress(tempStreet, tempWard, tempProvince) || "Chưa hoàn tất"}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-500/25 transition-all"
              >
                Lưu thông tin
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
