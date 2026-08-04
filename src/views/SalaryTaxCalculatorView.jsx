import React, { useState, useMemo } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { useAppContext } from "../context/AppContext";
import "../styles/SalaryTaxCalculatorView.css";

// Tax & Insurance Constants (VN Laws 2026)
const PERSONAL_DEDUCTION = 11000000; // 11M VND personal deduction
const DEPENDENT_REDUCTION = 4400000; // 4.4M VND per dependent
const BASE_SALARY_2026 = 2340000; // Lương cơ sở 2026 (đang dự kiến)

// PIT Progressive Tax Brackets
const TAX_BRACKETS = [
  { limit: 5000000, rate: 0.05 },
  { limit: 10000000, rate: 0.1 },
  { limit: 18000000, rate: 0.15 },
  { limit: 32000000, rate: 0.2 },
  { limit: 52000000, rate: 0.25 },
  { limit: 80000000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
];

// ==========================================
// VOLUNTARY INSURANCE PACKAGES (2026)
// ==========================================

// BHXH Tự nguyện – Mức đóng 22% của mức thu nhập chọn (trừ hỗ trợ 33,000đ/tháng từ Nhà nước)
const BHXH_PACKAGES = [
  { id: "bhxh_min",  label: "Gói Tối thiểu",  desc: "1.5M – Lương hưu mức cơ bản",  monthlyNet: 297000 },
  { id: "bhxh_avg",  label: "Gói Trung bình", desc: "3M – Lương hưu mức trung bình", monthlyNet: 627000 },
  { id: "bhxh_good", label: "Gói Khá",        desc: "5M – Lương hưu ổn định",        monthlyNet: 1067000 },
  { id: "bhxh_high", label: "Gói Cao",        desc: "10M – Lương hưu mức cao",       monthlyNet: 2167000 },
  { id: "bhxh_max",  label: "Mức tối đa",     desc: "50.6M – Hưởng tối đa",         monthlyNet: 11099000 },
];

// BHYT Hộ gia đình – Tính theo Lương cơ sở 2026 (2,340,000đ)
const BHYT_PACKAGES = [
  { id: "bhyt_1", label: "Người thứ 1", desc: "4.5% lương cơ sở",           monthlyAmount: Math.round(BASE_SALARY_2026 * 0.045) },
  { id: "bhyt_2", label: "Người thứ 2", desc: "3.15% (70% người thứ 1)",    monthlyAmount: Math.round(BASE_SALARY_2026 * 0.0315) },
  { id: "bhyt_3", label: "Người thứ 3", desc: "2.7% (60% người thứ 1)",     monthlyAmount: Math.round(BASE_SALARY_2026 * 0.027) },
  { id: "bhyt_4", label: "Người thứ 4", desc: "2.25% (50% người thứ 1)",    monthlyAmount: Math.round(BASE_SALARY_2026 * 0.0225) },
  { id: "bhyt_5", label: "Từ người thứ 5", desc: "1.8% (40% người thứ 1)", monthlyAmount: Math.round(BASE_SALARY_2026 * 0.018) },
];

// Bảo hiểm Tai nạn (Lao động tự do)
const ACCIDENT_INS_PACKAGES = [
  { id: "acci_tnnlđ", label: "TNLĐ Tự nguyện",      desc: "Theo NĐ 143/2024 – hỗ trợ suy giảm LĐ ≥5%", monthlyAmount: 34500 },
  { id: "acci_basic", label: "BH Tai nạn Cá nhân – Cơ bản", desc: "Bảo hiểm 20-50 triệu, ~56k-210k/năm",   monthlyAmount: 11000 },
  { id: "acci_plus",  label: "BH Tai nạn Cá nhân – Nâng cao", desc: "Bảo hiểm 100 triệu, ~165k/năm",       monthlyAmount: 14000 },
  { id: "acci_prem",  label: "BH Tai nạn Cao cấp",  desc: "Bảo Minh/Bảo Việt, 4-7 tỷ bảo vệ",         monthlyAmount: 1000000 },
];

export const SalaryTaxCalculatorView = () => {
  const { handleSetIncome, showToast } = useAppContext();

  // Salary & Insurance Inputs
  const [grossSalary, setGrossSalary] = useState("15000000");
  const [hasContract, setHasContract] = useState(true);
  const [dependentsCount, setDependentsCount] = useState(0);
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState("");

  // Voluntary Insurance Selections (for freelancers without labor contract)
  const [selectedBHXH, setSelectedBHXH] = useState(null);       // one BHXH package or null
  const [selectedBHYT, setSelectedBHYT] = useState(null);       // one BHYT tier or null
  const [selectedAccident, setSelectedAccident] = useState([]); // multiple accident packages

  // Total voluntary insurance per month
  const voluntaryInsuranceTotal = useMemo(() => {
    let total = 0;
    if (selectedBHXH) {
      const pkg = BHXH_PACKAGES.find(p => p.id === selectedBHXH);
      if (pkg) total += pkg.monthlyNet;
    }
    if (selectedBHYT) {
      const pkg = BHYT_PACKAGES.find(p => p.id === selectedBHYT);
      if (pkg) total += pkg.monthlyAmount;
    }
    selectedAccident.forEach(id => {
      const pkg = ACCIDENT_INS_PACKAGES.find(p => p.id === id);
      if (pkg) total += pkg.monthlyAmount;
    });
    return total;
  }, [selectedBHXH, selectedBHYT, selectedAccident]);

  // Living & Room Rent Cost Configuration
  const [isRenting, setIsRenting] = useState(true);
  const [roomRent, setRoomRent] = useState("3500000");
  
  // Electricity Meter Readings (Old & New)
  const [elecUnitPrice, setElecUnitPrice] = useState("3800");
  const [elecOldMeter, setElecOldMeter] = useState("1240");
  const [elecNewMeter, setElecNewMeter] = useState("1360");

  // Computed electricity usage (kWh = New - Old)
  const elecUsage = useMemo(() => {
    const oldM = Number(elecOldMeter) || 0;
    const newM = Number(elecNewMeter) || 0;
    return Math.max(0, newM - oldM);
  }, [elecOldMeter, elecNewMeter]);

  // Water Calculation Mode: 'volume' (m3) vs 'headcount' (people)
  const [waterCalcMode, setWaterCalcMode] = useState("volume");
  const [waterUnitPrice, setWaterUnitPrice] = useState("15000");
  const [waterOldMeter, setWaterOldMeter] = useState("42");
  const [waterNewMeter, setWaterNewMeter] = useState("50");
  const [waterPerPersonPrice, setWaterPerPersonPrice] = useState("100000");
  const [waterPersonCount, setWaterPersonCount] = useState("1");

  // Computed water usage (m³ = New - Old)
  const waterUsage = useMemo(() => {
    const oldM = Number(waterOldMeter) || 0;
    const newM = Number(waterNewMeter) || 0;
    return Math.max(0, newM - oldM);
  }, [waterOldMeter, waterNewMeter]);

  // Service Fee (Trash, Internet, Parking, Elevator, Building Management)
  const [serviceFee, setServiceFee] = useState("250000");

  // Calculate Net Salary & Taxes
  const calculation = useMemo(() => {
    const gross = Number(grossSalary) || 0;

    if (gross <= 0) {
      return {
        gross: 0,
        insuranceBHXH: 0,
        insuranceBHYT: 0,
        insuranceBHTN: 0,
        totalInsurance: 0,
        taxableIncome: 0,
        pitTax: 0,
        netSalary: 0,
      };
    }

    if (!hasContract) {
      // Freelance / Non-contractual: 10% PIT tax on income > 2M VND
      const pitTax = gross > 2000000 ? gross * 0.1 : 0;
      return {
        gross,
        insuranceBHXH: 0,
        insuranceBHYT: 0,
        insuranceBHTN: 0,
        totalInsurance: 0,
        taxableIncome: gross,
        pitTax,
        netSalary: gross - pitTax, // voluntaryInsuranceTotal deducted separately below
      };
    }

    // Official Labor Contract (HĐLĐ)
    const insBaseSalary = customInsuranceSalary ? Number(customInsuranceSalary) : gross;
    const insuranceBHXH = insBaseSalary * 0.08;
    const insuranceBHYT = insBaseSalary * 0.015;
    const insuranceBHTN = insBaseSalary * 0.01;
    const totalInsurance = insuranceBHXH + insuranceBHYT + insuranceBHTN;

    const incomeBeforeTax = gross - totalInsurance;
    const totalDeduction = PERSONAL_DEDUCTION + dependentsCount * DEPENDENT_REDUCTION;
    const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);

    // Calculate PIT Tax using 7 progressive tax brackets
    let pitTax = 0;
    let remainingTaxable = taxableIncome;
    let previousLimit = 0;

    for (const bracket of TAX_BRACKETS) {
      if (remainingTaxable <= 0) break;
      const bracketRange = bracket.limit - previousLimit;
      const taxableInBracket = Math.min(remainingTaxable, bracketRange);

      pitTax += taxableInBracket * bracket.rate;
      remainingTaxable -= taxableInBracket;
      previousLimit = bracket.limit;
    }

    const netSalary = gross - totalInsurance - pitTax;

    return {
      gross,
      insuranceBHXH,
      insuranceBHYT,
      insuranceBHTN,
      totalInsurance,
      taxableIncome,
      pitTax,
      netSalary,
    };
  }, [grossSalary, hasContract, dependentsCount, customInsuranceSalary]);

  // Calculate Rental & Utility Living Costs
  const livingCosts = useMemo(() => {
    if (!isRenting) {
      return {
        rent: 0,
        electricity: 0,
        water: 0,
        service: 0,
        totalLivingCost: 0,
      };
    }

    const rent = Number(roomRent) || 0;
    const electricity = (Number(elecUnitPrice) || 0) * (Number(elecUsage) || 0);

    let water = 0;
    if (waterCalcMode === "volume") {
      water = (Number(waterUnitPrice) || 0) * (Number(waterUsage) || 0);
    } else {
      water = (Number(waterPerPersonPrice) || 0) * (Number(waterPersonCount) || 0);
    }

    const service = Number(serviceFee) || 0;
    const totalLivingCost = rent + electricity + water + service;

    return {
      rent,
      electricity,
      water,
      service,
      totalLivingCost,
    };
  }, [isRenting, roomRent, elecUnitPrice, elecUsage, waterCalcMode, waterUnitPrice, waterUsage, waterPerPersonPrice, waterPersonCount, serviceFee]);

  // Final Remaining Disposable Income (deduct voluntary insurance for freelancers)
  const effectiveNetSalary = !hasContract
    ? calculation.netSalary - voluntaryInsuranceTotal
    : calculation.netSalary;
  const disposableIncome = effectiveNetSalary - livingCosts.totalLivingCost;

  // Sync Calculated Net Salary to App Monthly Income Context
  const handleApplyToIncome = () => {
    if (handleSetIncome) {
      handleSetIncome(effectiveNetSalary);
      if (showToast) {
        showToast(`Đã cập nhật Thu nhập hàng tháng thành ${formatCurrency(effectiveNetSalary)}!`, "success");
      } else {
        alert(`Đã cập nhật Thu nhập thành ${formatCurrency(effectiveNetSalary)}!`);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="page-title">
              Tính Lương, Thuế TNCN & Chi phí Trọ
            </h2>
            <p className="page-subtitle">
              Tính toán lương Net thực nhận sau Thuế & Bảo hiểm, kèm định giá điện nước phòng trọ
            </p>
          </div>

          <button
            onClick={handleApplyToIncome}
            className="sync-income-btn"
            title="Đưa số tiền lương Net vào Thu nhập hàng tháng"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Đồng bộ vào Thu nhập ứng dụng</span>
          </button>
        </div>
      </div>

      {/* TOP RESULT CARDS: Net Income Result Card & Monthly Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Net Income Result Card */}
        <div className="calc-card p-5 bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-white border-none shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300/80 block mb-1">
              Lương Net Thực Nhận (Sau Thuế & BH)
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(effectiveNetSalary)}
            </h3>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-stone-400 block">Lương Gross:</span>
              <span className="font-serif font-bold text-stone-200">{formatCurrency(calculation.gross)}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Tổng khấu trừ:</span>
              <span className="font-serif font-bold text-rose-400">
                -{formatCurrency(calculation.totalInsurance + calculation.pitTax + (!hasContract ? voluntaryInsuranceTotal : 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Living Expenses & Disposable Budget Result */}
        <div className="calc-card p-5 flex flex-col justify-between">
          <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
            Tổng kết Ngân sách Tháng
          </h4>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center p-2.5 bg-stone-100/50 dark:bg-stone-800/40 rounded-xl">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Lương Net thực nhận:
              </span>
              <span className="text-sm font-serif font-bold text-emerald-800 dark:text-emerald-400">
                +{formatCurrency(effectiveNetSalary)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-stone-100/50 dark:bg-stone-800/40 rounded-xl">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Tổng chi phí Trọ & Điện nước:
              </span>
              <span className="text-sm font-serif font-bold text-rose-700 dark:text-rose-400">
                -{formatCurrency(livingCosts.totalLivingCost)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl border border-emerald-300/60 dark:border-emerald-800">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Thu nhập ròng khả dụng:
              </span>
              <span className={`text-base font-serif font-extrabold ${disposableIncome < 0 ? "text-rose-700" : "text-emerald-800 dark:text-emerald-400"}`}>
                {formatCurrency(disposableIncome)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TOP 2-COLUMN GRID FOR SALARY CONFIG & DETAILED TAX BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (7 cols): Salary & Tax Config */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="calc-card p-6 h-full flex flex-col justify-between">
            <h3 className="calc-card-title border-b border-stone-200/50 dark:border-stone-700/60 pb-3 mb-4">
              1. Cấu hình Lương & Bảo hiểm (BHXH / Thuế)
            </h3>

            <div className="space-y-4">
              {/* Gross Salary Input */}
              <div>
                <label className="calc-label">Lương Gross hàng tháng (VNĐ)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value)}
                    placeholder="VD: 15000000"
                    className="calc-input text-lg font-serif font-bold text-emerald-800 dark:text-emerald-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
                    đ/tháng
                  </span>
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 italic">
                  = {formatCurrency(Number(grossSalary) || 0)}
                </p>
              </div>

              {/* Labor Contract Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-stone-100/40 dark:bg-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                <div>
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                    Có Hợp đồng Lao động (HĐLĐ)
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                    {hasContract ? "Đóng BHXH 8%, BHYT 1.5%, BHTN 1%" : "Khấu trừ Thuế TNCN 10% cho khoản > 2 triệu"}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 bg-white dark:bg-stone-800 p-1.5 px-3 rounded-full border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-200 whitespace-nowrap">
                    {hasContract ? "Có HĐLĐ" : "Không HĐLĐ"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasContract}
                    onClick={() => setHasContract(!hasContract)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hasContract ? "bg-emerald-800" : "bg-stone-300 dark:bg-stone-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        hasContract ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dependents Counter */}
              {hasContract && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="calc-label">Số người phụ thuộc</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDependentsCount(Math.max(0, dependentsCount - 1))}
                        className="counter-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={dependentsCount}
                        onChange={(e) => setDependentsCount(Math.max(0, Number(e.target.value) || 0))}
                        className="counter-input"
                      />
                      <button
                        type="button"
                        onClick={() => setDependentsCount(dependentsCount + 1)}
                        className="counter-btn"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block italic">
                      Giảm trừ: {formatCurrency(dependentsCount * DEPENDENT_REDUCTION)}/tháng
                    </span>
                  </div>

                  <div>
                    <label className="calc-label">Lương đóng BH (Để trống = Lương Gross)</label>
                    <input
                      type="number"
                      value={customInsuranceSalary}
                      onChange={(e) => setCustomInsuranceSalary(e.target.value)}
                      placeholder="Mức đóng bảo hiểm..."
                      className="calc-input text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Voluntary Insurance Selector (shown only when NO labor contract) */}
              {!hasContract && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-200/50 dark:border-stone-700/60">
                    <svg className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                    </svg>
                    <span className="text-sm font-serif font-bold text-stone-800 dark:text-stone-200">
                      Bảo hiểm Tự nguyện (Lao động tự do)
                    </span>
                  </div>

                  {/* BHXH Tự nguyện */}
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">BHXH Tự nguyện</span>
                      {selectedBHXH && (
                        <button type="button" onClick={() => setSelectedBHXH(null)} className="text-[10px] text-stone-400 hover:text-rose-500 transition-colors">
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1.5">
                      {BHXH_PACKAGES.map(pkg => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedBHXH(selectedBHXH === pkg.id ? null : pkg.id)}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                            selectedBHXH === pkg.id
                              ? "bg-blue-800 border-blue-700 text-white"
                              : "bg-white/70 dark:bg-stone-900/50 border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:border-blue-400 dark:hover:border-blue-600"
                          }`}
                        >
                          <span className="font-bold block">{pkg.label}</span>
                          <span className="opacity-75 block text-[10px] leading-tight mt-0.5">{pkg.desc}</span>
                          <span className={`font-serif font-extrabold block mt-1 ${
                            selectedBHXH === pkg.id ? "text-blue-200" : "text-blue-800 dark:text-blue-400"
                          }`}>{formatCurrency(pkg.monthlyNet)}/tháng</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BHYT Hộ gia đình */}
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">BHYT Hộ gia đình</span>
                      {selectedBHYT && (
                        <button type="button" onClick={() => setSelectedBHYT(null)} className="text-[10px] text-stone-400 hover:text-rose-500 transition-colors">
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {BHYT_PACKAGES.map(pkg => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedBHYT(selectedBHYT === pkg.id ? null : pkg.id)}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                            selectedBHYT === pkg.id
                              ? "bg-emerald-800 border-emerald-700 text-white"
                              : "bg-white/70 dark:bg-stone-900/50 border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:border-emerald-400 dark:hover:border-emerald-600"
                          }`}
                        >
                          <span className="font-bold block">{pkg.label}</span>
                          <span className="opacity-75 block text-[10px] leading-tight mt-0.5">{pkg.desc}</span>
                          <span className={`font-serif font-extrabold block mt-1 ${
                            selectedBHYT === pkg.id ? "text-emerald-200" : "text-emerald-800 dark:text-emerald-400"
                          }`}>{formatCurrency(pkg.monthlyAmount)}/tháng</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bảo hiểm Tai nạn */}
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/50">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block mb-2">Bảo hiểm Tai nạn (chọn nhiều)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ACCIDENT_INS_PACKAGES.map(pkg => {
                        const isSelected = selectedAccident.includes(pkg.id);
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedAccident(prev =>
                              isSelected ? prev.filter(id => id !== pkg.id) : [...prev, pkg.id]
                            )}
                            className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${
                              isSelected
                                ? "bg-amber-800 border-amber-700 text-white"
                                : "bg-white/70 dark:bg-stone-900/50 border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:border-amber-400 dark:hover:border-amber-600"
                            }`}
                          >
                            <span className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              isSelected ? "bg-white border-white" : "border-stone-400 dark:border-stone-600"
                            }`}>
                              {isSelected && <svg className="w-2.5 h-2.5 text-amber-800" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                            </span>
                            <span>
                              <span className="font-bold block">{pkg.label}</span>
                              <span className="opacity-75 block text-[10px] leading-tight mt-0.5">{pkg.desc}</span>
                              <span className={`font-serif font-extrabold block mt-1 ${
                                isSelected ? "text-amber-200" : "text-amber-800 dark:text-amber-400"
                              }`}>~{formatCurrency(pkg.monthlyAmount)}/tháng</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Voluntary Insurance Total Deduction Summary */}
                  {voluntaryInsuranceTotal > 0 && (
                    <div className="flex justify-between items-center p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/50">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-300">Tổng BH tự nguyện khấu trừ:</span>
                      <span className="font-serif font-extrabold text-rose-700 dark:text-rose-400 text-sm">-{formatCurrency(voluntaryInsuranceTotal)}/tháng</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Detailed Tax & Insurance Breakdown Table */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="calc-card p-6 h-full flex flex-col justify-between">
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 border-b border-stone-200/50 dark:border-stone-700/60 pb-3">
              {hasContract ? "Bảng Chi tiết Thuế & Bảo hiểm" : "Thuế & Bảo hiểm Tự nguyện"}
            </h4>

            <div className="space-y-2.5 text-xs flex-1 flex flex-col justify-center">
              {hasContract ? (
                // ── Chế độ CÓ HĐ ── hiển thị % chuẩn
                <>
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-500 dark:text-stone-400">BHXH (8%):</span>
                    <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{formatCurrency(calculation.insuranceBHXH)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-500 dark:text-stone-400">BHYT (1.5%):</span>
                    <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{formatCurrency(calculation.insuranceBHYT)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-500 dark:text-stone-400">BHTN (1%):</span>
                    <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{formatCurrency(calculation.insuranceBHTN)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 text-stone-800 dark:text-stone-200 font-bold">
                    <span>Tổng Bảo hiểm:</span>
                    <span className="font-serif">{formatCurrency(calculation.totalInsurance)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-500 dark:text-stone-400">Thu nhập tính thuế:</span>
                    <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{formatCurrency(calculation.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-rose-700 dark:text-rose-400 font-bold text-sm pt-1">
                    <span>Thuế TNCN phải nộp:</span>
                    <span className="font-serif font-extrabold">{formatCurrency(calculation.pitTax)}</span>
                  </div>
                </>
              ) : (
                // ── Chế độ KHÔNG HĐ ── hiển thị gói bảo hiểm tự nguyện đã chọn
                <>
                  {/* Thuế TNCN 10% */}
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                    <span className="text-stone-500 dark:text-stone-400">Thuế TNCN (10%):</span>
                    <span className="font-serif font-semibold text-rose-700 dark:text-rose-400">{formatCurrency(calculation.pitTax)}</span>
                  </div>

                  {/* BHXH tự nguyện đã chọn */}
                  {selectedBHXH ? (
                    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                      <span className="text-stone-500 dark:text-stone-400">
                        BHXH TV ({BHXH_PACKAGES.find(p => p.id === selectedBHXH)?.label}):
                      </span>
                      <span className="font-serif font-semibold text-blue-700 dark:text-blue-400">
                        {formatCurrency(BHXH_PACKAGES.find(p => p.id === selectedBHXH)?.monthlyNet ?? 0)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 opacity-40">
                      <span className="text-stone-400 italic">BHXH Tự nguyện:</span>
                      <span className="text-stone-400">Chưa chọn</span>
                    </div>
                  )}

                  {/* BHYT hộ gia đình đã chọn */}
                  {selectedBHYT ? (
                    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                      <span className="text-stone-500 dark:text-stone-400">
                        BHYT HGĐ ({BHYT_PACKAGES.find(p => p.id === selectedBHYT)?.label}):
                      </span>
                      <span className="font-serif font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(BHYT_PACKAGES.find(p => p.id === selectedBHYT)?.monthlyAmount ?? 0)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 opacity-40">
                      <span className="text-stone-400 italic">BHYT Hộ gia đình:</span>
                      <span className="text-stone-400">Chưa chọn</span>
                    </div>
                  )}

                  {/* Bảo hiểm tai nạn đã chọn */}
                  {selectedAccident.length > 0 ? (
                    selectedAccident.map(id => {
                      const pkg = ACCIDENT_INS_PACKAGES.find(p => p.id === id);
                      return pkg ? (
                        <div key={id} className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50">
                          <span className="text-stone-500 dark:text-stone-400">BH Tai nạn ({pkg.label}):</span>
                          <span className="font-serif font-semibold text-amber-700 dark:text-amber-400">~{formatCurrency(pkg.monthlyAmount)}</span>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 opacity-40">
                      <span className="text-stone-400 italic">BH Tai nạn:</span>
                      <span className="text-stone-400">Chưa chọn</span>
                    </div>
                  )}

                  {/* Tổng khấu trừ */}
                  <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-700/50 text-stone-800 dark:text-stone-200 font-bold">
                    <span>Tổng BH tự nguyện:</span>
                    <span className="font-serif">{formatCurrency(voluntaryInsuranceTotal)}</span>
                  </div>

                  {/* Lương Gross - 10% thuế - BH TV = Net thực nhận */}
                  <div className="mt-1 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">Lương Net thực nhận:</span>
                      <span className="font-serif font-extrabold text-sm text-emerald-700 dark:text-emerald-400">{formatCurrency(effectiveNetSalary)}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 italic">= Gross − Thuế 10% − BH tự nguyện</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FULL-WIDTH RENTAL & LIVING COST CONFIGURATION CARD (STRETCHES ACROSS 12 COLS) */}
      <div className="calc-card p-6 mt-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200/60 dark:border-stone-700/80 pb-4 mb-6">
          <h3 className="calc-card-title shrink">
            2. Cấu hình Phòng trọ, Điện nước & Dịch vụ
          </h3>

          <div className="shrink-0 flex items-center gap-2.5 bg-stone-100 dark:bg-stone-800 p-1.5 px-3 rounded-full border border-stone-200/80 dark:border-stone-700/80">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-200 whitespace-nowrap">
              {isRenting ? "Có ở trọ" : "Không ở trọ"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isRenting}
              onClick={() => setIsRenting(!isRenting)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isRenting ? "bg-emerald-800" : "bg-stone-300 dark:bg-stone-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isRenting ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {isRenting ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
            {/* Box 1: Room Rent */}
            <div className="bg-stone-100/40 dark:bg-stone-800/30 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center h-6 mb-2">
                  <label className="calc-label font-bold text-stone-700 dark:text-stone-200 mb-0">
                    Tiền Phòng Trọ
                  </label>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 italic">đ / tháng</span>
                </div>
                <div>
                  <label className="calc-label text-[10px] opacity-0 select-none block">Dự phòng</label>
                  <input
                    type="number"
                    value={roomRent}
                    onChange={(e) => setRoomRent(e.target.value)}
                    placeholder="VD: 3500000"
                    className="calc-input font-serif font-bold text-amber-700 dark:text-amber-400 text-sm h-9"
                  />
                </div>
              </div>
              <div className="text-right text-xs font-bold text-stone-600 dark:text-stone-400 pt-2 mt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                Tiền phòng: {formatCurrency(livingCosts.rent)}
              </div>
            </div>

            {/* Box 2: Service Fee */}
            <div className="bg-stone-100/40 dark:bg-stone-800/30 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center h-6 mb-2">
                  <label className="calc-label font-bold text-stone-700 dark:text-stone-200 mb-0">
                    Phí Dịch Vụ
                  </label>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 italic">Wifi, rác, xe...</span>
                </div>
                <div>
                  <label className="calc-label text-[10px] opacity-0 select-none block">Dự phòng</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                    placeholder="VD: 250000"
                    className="calc-input text-xs font-semibold h-9"
                  />
                </div>
              </div>
              <div className="text-right text-xs font-bold text-stone-600 dark:text-stone-400 pt-2 mt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                Phí dịch vụ: {formatCurrency(livingCosts.service)}
              </div>
            </div>

            {/* Box 3: Electricity Pricing & Usage */}
            <div className="bg-stone-100/40 dark:bg-stone-800/30 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center h-6 mb-2">
                  <label className="calc-label font-bold text-stone-700 dark:text-stone-200 mb-0">
                    Tiền Điện
                  </label>
                  <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    {elecUsage} kWh
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="calc-label text-[10px] text-center block" title="Đơn giá mỗi kWh điện">Giá (đ)</label>
                    <input
                      type="number"
                      value={elecUnitPrice}
                      onChange={(e) => setElecUnitPrice(e.target.value)}
                      className="calc-input text-xs px-1 text-center h-9 font-semibold"
                      placeholder="3800"
                    />
                  </div>
                  <div>
                    <label className="calc-label text-[10px] text-center block" title="Chỉ số công tơ điện cũ">Số cũ</label>
                    <input
                      type="number"
                      value={elecOldMeter}
                      onChange={(e) => setElecOldMeter(e.target.value)}
                      className="calc-input text-xs px-1 text-center h-9"
                      placeholder="Số cũ"
                    />
                  </div>
                  <div>
                    <label className="calc-label text-[10px] text-center block" title="Chỉ số công tơ điện mới">Số mới</label>
                    <input
                      type="number"
                      value={elecNewMeter}
                      onChange={(e) => setElecNewMeter(e.target.value)}
                      className="calc-input text-xs px-1 text-center h-9"
                      placeholder="Số mới"
                    />
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-bold text-amber-700 dark:text-amber-400 pt-2 mt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                Tiền điện ({elecUsage} kWh): {formatCurrency(livingCosts.electricity)}
              </div>
            </div>

            {/* Box 4: Water Pricing & Usage */}
            <div className="bg-stone-100/40 dark:bg-stone-800/30 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center h-6 mb-2">
                  <label className="calc-label font-bold text-stone-700 dark:text-stone-200 mb-0">
                    Tiền Nước
                  </label>
                  <div className="flex items-center gap-0.5 bg-stone-200/80 dark:bg-stone-700/80 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setWaterCalcMode("volume")}
                      className={`px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                        waterCalcMode === "volume"
                          ? "bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-400 shadow-xs"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      Theo m³
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaterCalcMode("headcount")}
                      className={`px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                        waterCalcMode === "headcount"
                          ? "bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-400 shadow-xs"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      Theo người
                    </button>
                  </div>
                </div>

                {waterCalcMode === "volume" ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="calc-label text-[10px] text-center block" title="Đơn giá mỗi m³ nước">Giá (đ)</label>
                      <input
                        type="number"
                        value={waterUnitPrice}
                        onChange={(e) => setWaterUnitPrice(e.target.value)}
                        className="calc-input text-xs px-1 text-center h-9 font-semibold"
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <label className="calc-label text-[10px] text-center block" title="Chỉ số đồng hồ nước cũ">Số cũ</label>
                      <input
                        type="number"
                        value={waterOldMeter}
                        onChange={(e) => setWaterOldMeter(e.target.value)}
                        className="calc-input text-xs px-1 text-center h-9"
                        placeholder="Số cũ"
                      />
                    </div>
                    <div>
                      <label className="calc-label text-[10px] text-center block" title="Chỉ số đồng hồ nước mới">Số mới</label>
                      <input
                        type="number"
                        value={waterNewMeter}
                        onChange={(e) => setWaterNewMeter(e.target.value)}
                        className="calc-input text-xs px-1 text-center h-9"
                        placeholder="Số mới"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="calc-label text-[10px] text-center block">Giá/người</label>
                      <input
                        type="number"
                        value={waterPerPersonPrice}
                        onChange={(e) => setWaterPerPersonPrice(e.target.value)}
                        className="calc-input text-xs px-1 text-center h-9 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="calc-label text-[10px] text-center block">Số người</label>
                      <input
                        type="number"
                        value={waterPersonCount}
                        onChange={(e) => setWaterPersonCount(e.target.value)}
                        className="calc-input text-xs px-1 text-center h-9"
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right text-xs font-bold text-emerald-800 dark:text-emerald-400 pt-2 mt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                Tiền nước ({waterCalcMode === "volume" ? `${waterUsage} m³` : `${waterPersonCount} người`}): {formatCurrency(livingCosts.water)}
              </div>
            </div>

            {/* Total Amount to Pay Landlord (Full Width Across All 4 Columns) */}
            <div className="sm:col-span-2 xl:col-span-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-xl mt-2">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Tổng tiền trả chủ nhà
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-3">
                <div className="flex flex-col p-2.5 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Tiền phòng:</span>
                  <span className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm mt-0.5">{formatCurrency(livingCosts.rent)}</span>
                </div>
                <div className="flex flex-col p-2.5 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Tiền điện:</span>
                  <span className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm mt-0.5">{formatCurrency(livingCosts.electricity)}</span>
                </div>
                <div className="flex flex-col p-2.5 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Tiền nước:</span>
                  <span className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm mt-0.5">{formatCurrency(livingCosts.water)}</span>
                </div>
                <div className="flex flex-col p-2.5 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Phí dịch vụ:</span>
                  <span className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm mt-0.5">{formatCurrency(livingCosts.service)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-amber-200/80 dark:border-amber-800/60">
                <span className="font-serif font-bold text-amber-900 dark:text-amber-300 text-sm sm:text-base">TỔNG CỘNG HÀNG THÁNG:</span>
                <span className="text-xl sm:text-2xl font-serif font-extrabold text-amber-800 dark:text-amber-400">
                  {formatCurrency(livingCosts.totalLivingCost)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-400 text-sm italic">
            Bạn đã chọn không ở trọ. Chi phí thuê nhà & điện nước trọ = 0đ.
          </div>
        )}
      </div>
    </div>
  );
};
