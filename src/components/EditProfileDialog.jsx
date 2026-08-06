import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import administrativeUnits from "../data/administrativeUnits.json";
import { convertGoogleDriveUrl } from "../utils/imageUtils";

// Custom Month Picker Component (Matches System Theme & Dark Mode)
const CustomMonthPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected month & year from value ("MM/YYYY")
  const parsed = useMemo(() => {
    if (value && value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);
        if (!isNaN(m) && !isNaN(y)) return { month: m, year: y };
      }
    }
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }, [value]);

  const [pickerYear, setPickerYear] = useState(parsed.year);

  // Synchronize year when value changes
  useEffect(() => {
    setPickerYear(parsed.year);
  }, [parsed.year]);

  const MONTH_NAMES = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const handleSelectMonth = (monthIndex) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, "0");
    onChange(`${formattedMonth}/${pickerYear}`);
    setIsOpen(false);
  };

  const handleSelectCurrentMonth = () => {
    const now = new Date();
    const formattedMonth = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    setPickerYear(year);
    onChange(`${formattedMonth}/${year}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tháng/Năm (Ví dụ: 06/2026)"
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 font-medium"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
          title="Mở lịch chọn tháng/năm tốt nghiệp"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Popover Custom Month Picker */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to dismiss on click outside */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 z-40 w-72 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl"
            >
              {/* Header: Year Switcher */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  ◀
                </button>
                <span className="font-serif font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-wider">
                  Năm {pickerYear}
                </span>
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  ▶
                </button>
              </div>

              {/* 3x4 Month Grid */}
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((name, idx) => {
                  const isSelected =
                    parsed.month === idx + 1 && parsed.year === pickerYear;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectMonth(idx)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold scale-105"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-rose-500 font-medium transition-colors cursor-pointer"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={handleSelectCurrentMonth}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Tháng hiện tại
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [bhxhCode, setBhxhCode] = useState("");
  const [taxId, setTaxId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [certificate, setCertificate] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [instagram, setInstagram] = useState("");
  const [petsStr, setPetsStr] = useState("");

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
      setBhxhCode(currentProfile.bhxhCode || "8222360105");
      setTaxId(currentProfile.taxId || "8472910382");
      setStudentEmail(currentProfile.studentEmail || "4801104066@student.hcmue.edu.vn");
      setGraduationDate(currentProfile.graduationDate || "06/2026");
      setCertificate(currentProfile.certificate || "Chứng chỉ Nghiệp vụ Sư phạm cho Giảng viên");
      setSkillsStr(Array.isArray(currentProfile.skills) ? currentProfile.skills.join(", ") : "ReactJS, VueJS, PHP, Automation Tester, Financial Planning");
      setInstagram(currentProfile.socials?.instagram || "@pkhang1412");
      setPetsStr(Array.isArray(currentProfile.pets) ? currentProfile.pets.join(", ") : "Vịt 🦆, Bắp 🌽, Lạc 🥜");

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

  // Month format helpers (YYYY-MM <-> MM/YYYY)
  const mmYyyyToMonthIso = (mmYyyy) => {
    if (!mmYyyy) return "";
    if (mmYyyy.includes("-")) return mmYyyy;
    const parts = mmYyyy.split("/");
    if (parts.length === 2 && parts[1].length === 4) {
      return `${parts[1]}-${parts[0].padStart(2, "0")}`;
    }
    return "";
  };

  const monthIsoToMmYyyy = (isoMonth) => {
    if (!isoMonth) return "";
    if (isoMonth.includes("/")) return isoMonth;
    const parts = isoMonth.split("-");
    if (parts.length === 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return isoMonth;
  };

  // Suggested list of degrees & certificates
  const SUGGESTED_CERTIFICATES = useMemo(
    () => [
      "Bằng Cử nhân ngành Công nghệ thông tin",
      "Chứng chỉ IELTS 7.0+",
      "Chứng chỉ Nghiệp vụ Sư phạm cho Giảng viên",
      "Chứng chỉ Vstep B2/C1",
      "Chứng chỉ Tin học Chuẩn Kỹ năng Sử dụng CNTT",
      "Chứng chỉ ISTQB / Tester Professional",
      "Chứng chỉ AWS Cloud Certified",
    ],
    []
  );

  const handleToggleCertificate = (certName) => {
    const currentList = certificate
      ? certificate.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    if (currentList.includes(certName)) {
      const newList = currentList.filter((c) => c !== certName);
      setCertificate(newList.join(", "));
    } else {
      const newList = [...currentList, certName];
      setCertificate(newList.join(", "));
    }
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

    const parsedSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    const parsedPets = petsStr.split(",").map(p => p.trim()).filter(Boolean);

    const updatedProfile = {
      ...currentProfile,
      fullName: fullName.trim(),
      dob: dob,
      phoneNumber: phoneNumber.trim(),
      idCardNumber: idCardNumber.trim(),
      bhxhCode: bhxhCode.trim(),
      taxId: taxId.trim(),
      studentEmail: studentEmail.trim(),
      graduationDate: graduationDate.trim(),
      certificate: certificate.trim(),
      skills: parsedSkills.length > 0 ? parsedSkills : ["ReactJS", "VueJS", "PHP", "Automation Tester"],
      pets: parsedPets.length > 0 ? parsedPets : ["Vịt 🦆", "Bắp 🌽", "Lạc 🥜"],
      socials: {
        ...(currentProfile?.socials || {}),
        instagram: instagram.trim() || "@pkhang1412",
      },
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] lg:max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Dialog Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
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
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Dialog Form Container */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Dialog Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Top Section Grid (2 Columns on Laptop) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Section 2: Digital Identity & Professional Profile */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span>2. Hồ sơ Chuyên môn & Định danh Kỹ thuật</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BHXH Code */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mã số BHXH (VssID)
                      </label>
                      <input
                        type="text"
                        value={bhxhCode}
                        onChange={(e) => setBhxhCode(e.target.value)}
                        placeholder="Ví dụ: 8222360105"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    {/* Tax ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mã số thuế cá nhân (eTax)
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="Ví dụ: 8472910382"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    {/* Student Email & MSSV */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Sinh viên / MSSV
                      </label>
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="4801104066@student.hcmue.edu.vn"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    {/* Graduation Date (Custom System Month Datepicker) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tháng Tốt nghiệp dự kiến
                      </label>
                      <CustomMonthPicker
                        value={graduationDate}
                        onChange={setGraduationDate}
                      />
                    </div>

                    {/* Certificate & Degree Section */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Bằng cấp và chứng chỉ
                      </label>
                      <input
                        type="text"
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                        placeholder="Nhập hoặc chọn các bằng cấp, chứng chỉ ở danh sách bên dưới..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      {/* Selectable Suggestion Chips for Certificates */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Danh sách chứng chỉ gợi ý (Click chọn / bỏ chọn nhanh):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTED_CERTIFICATES.map((certItem) => {
                            const isSelected = certificate
                              .split(",")
                              .map((c) => c.trim())
                              .includes(certItem);

                            return (
                              <button
                                key={certItem}
                                type="button"
                                onClick={() => handleToggleCertificate(certItem)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer border ${
                                  isSelected
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500"
                                }`}
                              >
                                <span className="font-bold">{isSelected ? "✓" : "+"}</span>
                                <span>{certItem}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Bộ kỹ năng lập trình (phân cách bởi dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        placeholder="ReactJS, VueJS, PHP, Automation Tester, Financial Planning"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Instagram Handle */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@pkhang1412"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Pets List */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Thú cưng (phân cách bởi dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={petsStr}
                        onChange={(e) => setPetsStr(e.target.value)}
                        placeholder="Vịt 🦆, Bắp 🌽, Lạc 🥜"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Bottom Section Grid: Address Information (2 Columns on Laptop) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Permanent Address Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <span>3. Địa chỉ thường trú (Sau sáp nhập)</span>
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

                {/* Temporary Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      <span>4. Địa chỉ tạm trú (Sau sáp nhập)</span>
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
              </div>
            </div>

            {/* Dialog Footer (Sticky Action Bar at bottom) */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur shrink-0">
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
