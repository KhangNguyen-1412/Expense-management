import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/SalaryTaxCalculatorView.css";

export const SalaryTaxCalculatorView = () => {
  const { formatCurrency, handleSetIncome, showToast } = useAppContext();

  // Salary & Insurance Inputs
  const [grossSalary, setGrossSalary] = useState(15000000);
  const [hasContract, setHasContract] = useState(true); // Có HĐLĐ hay không
  const [dependentsCount, setDependentsCount] = useState(0);
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState(""); // Rỗng = bằng Lương Gross

  // Living / Rental Inputs
  const [isRenting, setIsRenting] = useState(true);
  const [roomRent, setRoomRent] = useState(3500000);

  // Pricing Config - Electricity
  const [elecUnitPrice, setElecUnitPrice] = useState(3800); // 3,800 đ/kWh
  const [elecUsage, setElecUsage] = useState(120); // 120 kWh

  // Pricing Config - Water (Volume vs Headcount mode)
  const [waterCalcMode, setWaterCalcMode] = useState("volume"); // "volume" | "headcount"
  const [waterUnitPrice, setWaterUnitPrice] = useState(15000); // 15,000 đ/m3
  const [waterUsage, setWaterUsage] = useState(8); // 8 m3
  const [waterPerPersonPrice, setWaterPerPersonPrice] = useState(80000); // 80,000 đ/người/tháng
  const [waterPersonCount, setWaterPersonCount] = useState(1); // 1 người

  // Service Fee (Includes Internet, Trash, Elevator, Parking)
  const [serviceFee, setServiceFee] = useState(250000);

  // Tax & Insurance Constants (Vietnam Regulations)
  const BASE_SALARY = 2340000; // Lương cơ sở
  const REGIONAL_MIN_SALARY = 4960000; // Lương tối thiểu vùng I
  const MAX_INSURANCE_BASE_BHXH_BHYT = 20 * BASE_SALARY; // 46,800,000đ
  const MAX_INSURANCE_BASE_BHTN = 20 * REGIONAL_MIN_SALARY; // 99,200,000đ

  const SELF_REDUCTION = 11000000; // 11 triệu/tháng
  const DEPENDENT_REDUCTION = 4400000; // 4.4 triệu/người/tháng

  // Calculation Results
  const calculation = useMemo(() => {
    const gross = Number(grossSalary) || 0;

    if (!hasContract) {
      // Không hợp đồng lao động: Khấu trừ thuế TNCN 10% cho thu nhập từ 2 triệu/lần trở lên
      const insuranceBHXH = 0;
      const insuranceBHYT = 0;
      const insuranceBHTN = 0;
      const totalInsurance = 0;

      const pitTax = gross >= 2000000 ? Math.round(gross * 0.1) : 0;
      const netSalary = gross - pitTax;

      return {
        gross,
        insuranceBHXH,
        insuranceBHYT,
        insuranceBHTN,
        totalInsurance,
        totalReductions: 0,
        taxableIncome: gross,
        pitTax,
        netSalary,
      };
    }

    // Xác định mức lương làm căn cứ đóng bảo hiểm
    const insuranceBaseInput = customInsuranceSalary ? Number(customInsuranceSalary) : gross;
    const baseBHXH_BHYT = Math.min(insuranceBaseInput, MAX_INSURANCE_BASE_BHXH_BHYT);
    const baseBHTN = Math.min(insuranceBaseInput, MAX_INSURANCE_BASE_BHTN);

    // Tính Bảo hiểm bắt buộc
    const insuranceBHXH = Math.round(baseBHXH_BHYT * 0.08); // 8%
    const insuranceBHYT = Math.round(baseBHXH_BHYT * 0.015); // 1.5%
    const insuranceBHTN = Math.round(baseBHTN * 0.01); // 1%
    const totalInsurance = insuranceBHXH + insuranceBHYT + insuranceBHTN;

    // Giảm trừ
    const totalDependentReduction = dependentsCount * DEPENDENT_REDUCTION;
    const totalReductions = SELF_REDUCTION + totalDependentReduction;

    // Thu nhập chịu thuế & Thu nhập tính thuế
    const incomeBeforeTax = gross - totalInsurance;
    const taxableIncome = Math.max(0, incomeBeforeTax - totalReductions);

    // Biểu thuế lũy tiến 7 bậc
    let pitTax = 0;
    if (taxableIncome > 0) {
      if (taxableIncome <= 5000000) {
        pitTax = taxableIncome * 0.05;
      } else if (taxableIncome <= 10000000) {
        pitTax = taxableIncome * 0.1 - 250000;
      } else if (taxableIncome <= 18000000) {
        pitTax = taxableIncome * 0.15 - 750000;
      } else if (taxableIncome <= 32000000) {
        pitTax = taxableIncome * 0.2 - 1650000;
      } else if (taxableIncome <= 52000000) {
        pitTax = taxableIncome * 0.25 - 3250000;
      } else if (taxableIncome <= 80000000) {
        pitTax = taxableIncome * 0.3 - 5850000;
      } else {
        pitTax = taxableIncome * 0.35 - 9850000;
      }
    }

    pitTax = Math.round(Math.max(0, pitTax));
    const netSalary = gross - totalInsurance - pitTax;

    return {
      gross,
      insuranceBHXH,
      insuranceBHYT,
      insuranceBHTN,
      totalInsurance,
      totalReductions,
      taxableIncome,
      pitTax,
      netSalary,
    };
  }, [grossSalary, hasContract, customInsuranceSalary, dependentsCount]);

  // Living & Rental Expenses Calculation
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

    const water = waterCalcMode === "volume"
      ? (Number(waterUnitPrice) || 0) * (Number(waterUsage) || 0)
      : (Number(waterPerPersonPrice) || 0) * (Number(waterPersonCount) || 0);

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

  // Final Remaining Disposable Income
  const disposableIncome = calculation.netSalary - livingCosts.totalLivingCost;

  // Sync Calculated Net Salary to App Monthly Income Context
  const handleApplyToIncome = () => {
    if (handleSetIncome) {
      handleSetIncome(calculation.netSalary);
      if (showToast) {
        showToast(`Đã cập nhật Thu nhập hàng tháng thành ${formatCurrency(calculation.netSalary)}!`, "success");
      } else {
        alert(`Đã cập nhật Thu nhập thành ${formatCurrency(calculation.netSalary)}!`);
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

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Config Inputs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Salary & Tax Config */}
          <div className="calc-card p-5">
            <h3 className="calc-card-title border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
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
                    className="calc-input text-lg font-bold text-indigo-600 dark:text-indigo-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    đ/tháng
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  = {formatCurrency(Number(grossSalary) || 0)}
                </p>
              </div>

              {/* Labor Contract Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                    Có Hợp đồng Lao động (HĐLĐ)
                  </span>
                  <span className="text-xs text-slate-400">
                    {hasContract ? "Đóng BHXH 8%, BHYT 1.5%, BHTN 1%" : "Khấu trừ Thuế TNCN 10% cho khoản > 2 triệu"}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 bg-white dark:bg-slate-800 p-1.5 px-3 rounded-full border border-slate-200/80 dark:border-slate-600/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {hasContract ? "Có HĐLĐ" : "Không HĐLĐ"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasContract}
                    onClick={() => setHasContract(!hasContract)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hasContract ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
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
                    <span className="text-[11px] text-slate-400 mt-1 block">
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
            </div>
          </div>

          {/* Card 2: Living Costs & Rental Pricing Configuration */}
          <div className="calc-card p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-3 mb-4">
              <h3 className="calc-card-title shrink">
                2. Cấu hình Phòng trọ, Điện nước & Dịch vụ
              </h3>

              <div className="shrink-0 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-700/50 p-1.5 px-3 rounded-full border border-slate-200/80 dark:border-slate-600/80">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {isRenting ? "Có ở trọ" : "Không ở trọ"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRenting}
                  onClick={() => setIsRenting(!isRenting)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isRenting ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
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
              <div className="space-y-4">
                {/* Room Rent */}
                <div>
                  <label className="calc-label">Tiền phòng trọ / tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={roomRent}
                    onChange={(e) => setRoomRent(e.target.value)}
                    placeholder="VD: 3500000"
                    className="calc-input font-bold text-amber-600 dark:text-amber-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    = {formatCurrency(Number(roomRent) || 0)}
                  </p>
                </div>

                {/* Electricity Pricing & Usage */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
                  <div>
                    <label className="calc-label">Định giá Điện (đ/kWh)</label>
                    <input
                      type="number"
                      value={elecUnitPrice}
                      onChange={(e) => setElecUnitPrice(e.target.value)}
                      className="calc-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="calc-label">Số kWh dùng/tháng</label>
                    <input
                      type="number"
                      value={elecUsage}
                      onChange={(e) => setElecUsage(e.target.value)}
                      className="calc-input text-xs"
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-amber-600 dark:text-amber-400">
                    Tiền điện: {formatCurrency(livingCosts.electricity)}
                  </div>
                </div>

                {/* Water Pricing & Usage (Volume vs Headcount Toggle) */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="calc-label font-bold text-slate-700 dark:text-slate-200">
                      Tiền Nước
                    </label>
                    <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-600/80 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setWaterCalcMode("volume")}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          waterCalcMode === "volume"
                            ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        Theo m³
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaterCalcMode("headcount")}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          waterCalcMode === "headcount"
                            ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        Theo người
                      </button>
                    </div>
                  </div>

                  {waterCalcMode === "volume" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="calc-label">Định giá Nước (đ/m³)</label>
                        <input
                          type="number"
                          value={waterUnitPrice}
                          onChange={(e) => setWaterUnitPrice(e.target.value)}
                          className="calc-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="calc-label">Khối lượng m³ dùng</label>
                        <input
                          type="number"
                          value={waterUsage}
                          onChange={(e) => setWaterUsage(e.target.value)}
                          className="calc-input text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="calc-label">Giá nước (đ/người/tháng)</label>
                        <input
                          type="number"
                          value={waterPerPersonPrice}
                          onChange={(e) => setWaterPerPersonPrice(e.target.value)}
                          className="calc-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="calc-label">Số người ở</label>
                        <input
                          type="number"
                          value={waterPersonCount}
                          onChange={(e) => setWaterPersonCount(e.target.value)}
                          className="calc-input text-xs"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-right text-xs font-bold text-cyan-600 dark:text-cyan-400 pt-1 border-t border-slate-200/50 dark:border-slate-600/50">
                    Tiền nước ({waterCalcMode === "volume" ? `${waterUsage} m³` : `${waterPersonCount} người`}): {formatCurrency(livingCosts.water)}
                  </div>
                </div>

                {/* Service Fee (Includes Internet, Trash, Elevator, Parking) */}
                <div>
                  <label className="calc-label">
                    Phí dịch vụ / tháng (Bao gồm Internet, Vệ sinh, Thang máy, Giữ xe)
                  </label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                    placeholder="VD: 250000"
                    className="calc-input text-xs font-semibold"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    = {formatCurrency(Number(serviceFee) || 0)}
                  </p>
                </div>

                {/* Total Amount to Pay Landlord */}
                <div className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Tổng tiền trả chủ nhà
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Tiền phòng:</span>
                      <span className="font-semibold">{formatCurrency(livingCosts.rent)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Tiền điện:</span>
                      <span className="font-semibold">{formatCurrency(livingCosts.electricity)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Tiền nước:</span>
                      <span className="font-semibold">{formatCurrency(livingCosts.water)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Phí dịch vụ:</span>
                      <span className="font-semibold">{formatCurrency(livingCosts.service)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-amber-300/60 dark:border-amber-700/60">
                      <span className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                        TỔNG CỘNG:
                      </span>
                      <span className="font-extrabold text-lg text-amber-700 dark:text-amber-400">
                        {formatCurrency(livingCosts.totalLivingCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                Bạn đã chọn không ở trọ. Chi phí thuê nhà & điện nước trọ = 0đ.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Breakdown Results Dashboard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Net Income Result Card */}
          <div className="calc-card p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 block mb-1">
              Lương Net Thực Nhận (Sau Thuế & BH)
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency(calculation.netSalary)}
            </h3>

            <div className="mt-4 pt-3 border-t border-indigo-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-indigo-300 block">Lương Gross:</span>
                <span className="font-bold">{formatCurrency(calculation.gross)}</span>
              </div>
              <div>
                <span className="text-indigo-300 block">Tổng khấu trừ:</span>
                <span className="font-bold text-rose-300">
                  -{formatCurrency(calculation.totalInsurance + calculation.pitTax)}
                </span>
              </div>
            </div>
          </div>

          {/* Living Expenses & Disposable Budget Result */}
          <div className="calc-card p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Tổng kết Ngân sách Tháng
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Lương Net thực nhận:
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(calculation.netSalary)}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tổng chi phí Trọ & Điện nước:
                </span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(livingCosts.totalLivingCost)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  Thu nhập ròng khả dụng:
                </span>
                <span className={`text-base font-extrabold ${disposableIncome < 0 ? "text-rose-600" : "text-indigo-600 dark:text-indigo-400"}`}>
                  {formatCurrency(disposableIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Tax & Insurance Breakdown Table */}
          <div className="calc-card p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Bảng Chi tiết Thuế & Bảo hiểm
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">BHXH (8%):</span>
                <span className="font-semibold">{formatCurrency(calculation.insuranceBHXH)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">BHYT (1.5%):</span>
                <span className="font-semibold">{formatCurrency(calculation.insuranceBHYT)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">BHTN (1%):</span>
                <span className="font-semibold">{formatCurrency(calculation.insuranceBHTN)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-bold">
                <span>Tổng Bảo hiểm:</span>
                <span>{formatCurrency(calculation.totalInsurance)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500">Thu nhập tính thuế:</span>
                <span className="font-semibold">{formatCurrency(calculation.taxableIncome)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span>Thuế TNCN phải nộp:</span>
                <span>{formatCurrency(calculation.pitTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
