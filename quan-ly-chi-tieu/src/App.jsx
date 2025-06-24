import React, { useState, useEffect, useMemo } from 'react';

// =================================================================
// PHẦN 1: CẤU HÌNH, THƯ VIỆN VÀ CÁC HẰNG SỐ
// =================================================================
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// Chart.js và wrapper cho React
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyASuFkA_nSITnxb4sWr_MDEDx1n41ejih0",
    authDomain: "wweb-34134.firebaseapp.com",
    projectId: "wweb-34134",
    storageBucket: "wweb-34134.appspot.com",
    messagingSenderId: "103296355774",
    appId: "1:103296355774:web:d5d4ca8bd1127ef2957def",
    measurementId: "G-0PSEW4N99E"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const SPENDING_CATEGORIES = [
    'Ăn uống', 'Đi lại', 'Hóa đơn', 'Mua sắm', 'Giải trí', 'Sức khỏe', 'Giáo dục', 'Gia đình', 'Khác'
];


// =================================================================
// PHẦN 2: CÁC COMPONENT GIAO DIỆN PHỤ (UI Components)
// =================================================================

const Transaction = ({ transaction, onDelete }) => {
    const isExpense = transaction.amount < 0;
    const sign = isExpense ? '-' : '+';
    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(num));
    const Icon = ({ category }) => {
        const categoryIcons = {
            'Ăn uống': 'M17 2a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2h-2zm-4 4a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2zm-4-4a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H7z',
            'Đi lại': 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
            'Mua sắm': 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z',
        };
        const path = categoryIcons[category] || 'M20 7l-8.225 8.225-3.525-3.525-4.25 4.25V7H20z';
        return <svg className="w-6 h-6 mr-3 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d={path}></path></svg>;
    };
    return (
        <li className={`flex items-center bg-white dark:bg-slate-800 p-4 my-2 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 relative group`}>
             {isExpense && <Icon category={transaction.category} />}
            <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{transaction.text}</p>
                {transaction.createdAt && <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(transaction.createdAt.seconds * 1000).toLocaleDateString('vi-VN')}</p>}
            </div>
             <span className={`font-bold text-lg ${isExpense ? 'text-red-500' : 'text-green-500'}`}>{sign}{formatCurrency(transaction.amount)}</span>
            <button onClick={() => onDelete(transaction.id)} className="absolute right-2 -translate-x-full bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-700">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </li>
    );
};

const AnalysisResult = ({ analysis, isLoading, error }) => {
    if (isLoading) { return <div className="mt-6 p-6 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-center"><div className="flex justify-center items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-blue-700 dark:text-blue-400 font-medium">Chuyên gia AI đang phân tích...</p></div></div>; }
    if (error) { return <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-lg"><h4 className="font-bold text-red-800 dark:text-red-400">Đã xảy ra lỗi</h4><p className="text-red-700 dark:text-red-400">{error}</p></div>; }
    if (!analysis) return null;
    return (
        <div className="mt-6 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">💡 Phân tích từ Chuyên gia AI</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis }}></div>
        </div>
    );
};

const BudgetStatus = ({ transactions, budgets, formatCurrency }) => {
    const categorySpending = useMemo(() => {
        return transactions.filter(t => t.amount < 0).reduce((acc, t) => {
                const category = t.category || 'Khác';
                acc[category] = (acc[category] || 0) + Math.abs(t.amount);
                return acc;
            }, {});
    }, [transactions]);
    if (Object.keys(budgets).length === 0) { return <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 text-center text-slate-500 dark:text-slate-400"><p>Bạn chưa thiết lập ngân sách. Hãy vào mục "Ngân sách" để bắt đầu.</p></div>; }
    const colors = ['#4f46e5', '#7c3aed', '#db2777', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];
    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-5">Tình hình Ngân sách</h3>
            <div className="space-y-5">
                {Object.entries(budgets).map(([category, budgetAmount], index) => {
                    if (budgetAmount <= 0) return null;
                    const spentAmount = categorySpending[category] || 0;
                    const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                    const remaining = budgetAmount - spentAmount;
                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{category}</span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: percentage > 100 ? '#ef4444' : colors[index % colors.length] }}></div>
                            </div>
                             <p className={`text-sm text-right mt-1.5 font-medium ${remaining < 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                {remaining >= 0 ? `Còn lại: ${formatCurrency(remaining)}` : `Vượt mức: ${formatCurrency(Math.abs(remaining))}`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// =================================================================
// PHẦN 3: CÁC COMPONENT VIEW CHÍNH VÀ SIDEBAR
// =================================================================

const Sidebar = ({ activeView, setActiveView, user, theme, toggleTheme }) => {
    const navItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' },
        { id: 'statistics', label: 'Báo cáo', icon: 'M16 8.5l-4.5 4.5-2.5-2.5-4.5 4.5V7H16v1.5z' },
        { id: 'budget', label: 'Ngân sách', icon: 'M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3L21.5 11.5z' },
        { id: 'history', label: 'Lịch sử', icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' },
        { id: 'add', label: 'Thêm Mới', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
    ];
    return (
         <aside className="w-20 lg:w-64 bg-white dark:bg-slate-900 flex-shrink-0 p-4 lg:p-6 flex flex-col items-center lg:items-stretch shadow-2xl dark:shadow-none transition-all duration-300">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 lg:mb-4 hidden lg:block">Trợ lý Chi tiêu</h1>
            {user && <p className="text-xs text-slate-400 dark:text-slate-500 mb-10 hidden lg:block break-words">UserID: {user.uid}</p>}
            <nav className="flex flex-col space-y-3 w-full">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex items-center justify-center lg:justify-start text-lg font-semibold p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/50' : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:mr-3" viewBox="0 0 24 24" fill="currentColor"><path d={item.icon}/></svg>
                        <span className="hidden lg:inline">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto flex flex-col items-center lg:items-stretch">
                <div className="flex items-center justify-center lg:justify-between mb-2">
                    <span className="hidden lg:inline font-semibold text-slate-600 dark:text-slate-300">Giao diện tối</span>
                    <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>
        </aside>
    );
};

const StatisticsView = ({ transactions, formatCurrency }) => {
    const [activePreset, setActivePreset] = useState('thisMonth');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });

    const handlePresetClick = (preset) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (preset) {
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            default: break;
        }
        
        setActivePreset(preset);
        setDateRange({ startDate: start, endDate: end });
    };

    const reportData = useMemo(() => {
        const { startDate, endDate } = dateRange;
        if (!startDate || !endDate) return { spendingByCategory: {}, spendingByDay: {}, totalSpending: 0 };
        
        const startOfDay = new Date(startDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(endDate.setHours(23, 59, 59, 999));

        const filtered = transactions.filter(t => {
            const transDate = t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000) : new Date(0);
            return transDate >= startOfDay && transDate <= endOfDay;
        });

        const spendingByCategory = filtered.filter(t => t.amount < 0).reduce((acc, t) => {
            const category = t.category || 'Khác';
            acc[category] = (acc[category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
        
        const spendingByDay = filtered.filter(t => t.amount < 0).reduce((acc, t) => {
            const day = new Date(t.createdAt.seconds * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            acc[day] = (acc[day] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        const totalSpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

        return { spendingByCategory, spendingByDay, totalSpending };
    }, [transactions, dateRange]);

    const chartData = {
        category: {
            labels: Object.keys(reportData.spendingByCategory),
            datasets: [{
                label: 'Chi tiêu',
                data: Object.values(reportData.spendingByCategory),
                backgroundColor: ['#4f46e5', '#7c3aed', '#db2777', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'],
                borderColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                borderWidth: 2,
            }]
        },
        trend: {
            labels: Object.keys(reportData.spendingByDay),
            datasets: [{
                label: 'Chi tiêu hàng ngày',
                data: Object.values(reportData.spendingByDay),
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                tension: 0.1
            }]
        }
    };
    
    const chartOptions = (title, displayScales = false) => ({
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#475569' } },
            title: { display: true, text: title, color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b', font: { size: 16 } }
        },
        scales: displayScales ? {
            y: { ticks: { color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#6b7280' } },
            x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#6b7280' } }
        } : {}
    });

    const FilterButton = ({ label, preset }) => (
        <button onClick={() => handlePresetClick(preset)} className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${activePreset === preset ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Lọc Báo cáo</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <FilterButton label="Tháng này" preset="thisMonth" />
                        <FilterButton label="Tháng trước" preset="lastMonth" />
                        <FilterButton label="Năm nay" preset="thisYear" />
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <DatePicker selected={dateRange.startDate} onChange={(date) => { setDateRange(prev => ({ ...prev, startDate: date })); setActivePreset(null); }} selectsStart startDate={dateRange.startDate} endDate={dateRange.endDate} dateFormat="dd/MM/yyyy" className="w-32 p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        <span>-</span>
                        <DatePicker selected={dateRange.endDate} onChange={(date) => { setDateRange(prev => ({ ...prev, endDate: date })); setActivePreset(null); }} selectsEnd startDate={dateRange.startDate} endDate={dateRange.endDate} minDate={dateRange.startDate} dateFormat="dd/MM/yyyy" className="w-32 p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
            </div>

            {reportData.totalSpending > 0 ? (
                 <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-3 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
                         <Line options={chartOptions('Xu hướng chi tiêu', true)} data={chartData.trend} />
                    </div>
                     <div className="xl:col-span-2 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none rounded-xl p-4 sm:p-6">
                         <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">Tỷ trọng chi tiêu</h4>
                         <Pie options={chartOptions('', false)} data={chartData.category} />
                    </div>
                 </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-12 text-center">
                    <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Không có dữ liệu</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Không tìm thấy giao dịch chi tiêu nào trong khoảng thời gian đã chọn.</p>
                </div>
            )}
        </div>
    );
};

const DashboardView = ({ transactions, income, expense, total, budgets, handleAnalyzeSpending, analysis, isLoading, error, formatCurrency }) => ( <div className="space-y-8"> <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-8"> <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số dư của bạn</h2> <p className="text-6xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{formatCurrency(total)}</p> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 flex items-center"> <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div> <div><h3 className="text-lg uppercase text-slate-500 dark:text-slate-400 font-semibold">Thu nhập</h3><p className="text-3xl font-bold text-green-600 dark:text-green-500">{formatCurrency(income)}</p></div> </div> <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 flex items-center"> <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg></div> <div><h3 className="text-lg uppercase text-slate-500 dark:text-slate-400 font-semibold">Chi tiêu</h3><p className="text-3xl font-bold text-red-500">{formatCurrency(Math.abs(expense))}</p></div> </div> </div> <BudgetStatus transactions={transactions} budgets={budgets} formatCurrency={formatCurrency} /> <div> <button onClick={handleAnalyzeSpending} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V5a1 1 0 00-1-1H8a1 1 0 00-1 1v1H5V4z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 9a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM6 11.5a.5.5 0 000 1h3a.5.5 0 000-1H6zM8.5 7a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 4a.5.5 0 000 1h2a.5.5 0 000-1h-2z" clipRule="evenodd" /></svg> Phân tích với AI </button> <AnalysisResult analysis={analysis} isLoading={isLoading} error={error} /> </div> </div> );
const HistoryView = ({ transactions, onDeleteTransaction }) => { const [filter, setFilter] = useState('all'); const filteredTransactions = useMemo(() => { const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); if (filter === 'today') { return transactions.filter(t => { if (!t.createdAt?.seconds) return false; return new Date(t.createdAt.seconds * 1000) >= today; }); } if (filter === 'week') { return transactions.filter(t => { if (!t.createdAt?.seconds) return false; return new Date(t.createdAt.seconds * 1000) >= startOfWeek; }); } return transactions; }, [transactions, filter]); const FilterButton = ({ value, label }) => ( <button onClick={() => setFilter(value)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === value ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} > {label} </button> ); return ( <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-4"> <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-0">Lịch sử Giao dịch</h3> <div className="flex items-center space-x-2"> <FilterButton value="all" label="Tất cả" /> <FilterButton value="today" label="Hôm nay" /> <FilterButton value="week" label="Tuần này" /> </div> </div> <ul className="list-none p-0 max-h-[70vh] overflow-y-auto pr-2"> {filteredTransactions.length > 0 ? ( filteredTransactions.map(t => <Transaction key={t.id} transaction={t} onDelete={onDeleteTransaction} />) ) : ( <p className="text-center text-slate-500 dark:text-slate-400 py-10">Không có giao dịch nào phù hợp với bộ lọc.</p> )} </ul> </div> ); };
const AddTransactionView = ({ onAddTransaction }) => { const [text, setText] = useState(''); const [amount, setAmount] = useState(''); const [category, setCategory] = useState(SPENDING_CATEGORIES[0]); const handleSubmit = (e) => { e.preventDefault(); if (text.trim() === '' || amount.trim() === '') return; onAddTransaction({ text, amount: +amount, category: +amount < 0 ? category : null }); setText(''); setAmount(''); setCategory(SPENDING_CATEGORIES[0]); }; return ( <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 max-w-lg mx-auto"><h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Thêm giao dịch mới</h3> <form onSubmit={handleSubmit} className="space-y-5"> <div><label htmlFor="text" className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Nội dung</label><input type="text" id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="VD: Cà phê cuối tuần" className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"/></div> <div><label htmlFor="amount" className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Số tiền <span className="font-normal text-sm text-slate-500">(âm - chi tiêu)</span></label><input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="VD: -50000" className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"/></div> {amount && +amount < 0 && (<div><label htmlFor="category" className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Hạng mục chi tiêu</label><select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">{SPENDING_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>)} <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 text-lg">Thêm giao dịch</button> </form> </div> ); };
const BudgetView = ({ income, budgets, onSetBudgets, formatCurrency }) => { const [localBudgets, setLocalBudgets] = useState(budgets || {}); useEffect(() => { setLocalBudgets(budgets); }, [budgets]); const totalBudgeted = useMemo(() => Object.values(localBudgets).reduce((sum, amount) => sum + (Number(amount) || 0), 0), [localBudgets]); const unallocated = income - totalBudgeted; const handleBudgetChange = (category, amount) => setLocalBudgets(prev => ({ ...prev, [category]: Number(amount) >= 0 ? Number(amount) : 0 })); const handleSave = () => { onSetBudgets(localBudgets); }; return ( <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl p-6 max-w-2xl mx-auto"><h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Thiết lập Ngân sách</h3> <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center"> <div><h4 className="text-slate-500 dark:text-slate-400 font-semibold">Tổng thu nhập</h4><p className="font-bold text-2xl text-green-600 dark:text-green-500 mt-1">{formatCurrency(income)}</p></div> <div><h4 className="text-slate-500 dark:text-slate-400 font-semibold">Đã phân bổ</h4><p className="font-bold text-2xl text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalBudgeted)}</p></div> <div><h4 className="text-slate-500 dark:text-slate-400 font-semibold">Chưa phân bổ</h4><p className={`font-bold text-2xl mt-1 ${unallocated < 0 ? 'text-red-600 dark:text-red-500' : 'text-orange-500'}`}>{formatCurrency(unallocated)}</p></div> </div> <div className="space-y-4"> {SPENDING_CATEGORIES.map(category => ( <div key={category} className="grid grid-cols-3 items-center gap-4"> <label htmlFor={`budget-${category}`} className="font-semibold text-slate-700 dark:text-slate-300 col-span-1">{category}</label> <input type="number" id={`budget-${category}`} value={localBudgets[category] || ''} onChange={(e) => handleBudgetChange(category, e.target.value)} placeholder="0" className="w-full p-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-2 transition-shadow"/> </div> ))} </div> <button onClick={handleSave} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 text-lg">Lưu Ngân sách</button> </div> ); };


// =================================================================
// PHẦN 4: COMPONENT APP CHÍNH
// =================================================================
export default function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState({});
    const [activeView, setActiveView] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setAuthError('');
            } else {
                signInAnonymously(auth).catch(err => {
                    console.error("Lỗi đăng nhập ẩn danh:", err);
                    setAuthError('Lỗi kết nối hoặc cấu hình. Đảm bảo đã bật "Anonymous" sign-in trong Firebase Authentication và kiểm tra lại các quy tắc bảo mật của Firestore.');
                });
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const transColRef = collection(db, `users/${user.uid}/transactions`);
        const transQuery = query(transColRef, orderBy('createdAt', 'desc'));
        const unsubscribeTrans = onSnapshot(transQuery, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
        const budgetDocRef = doc(db, `users/${user.uid}/budgets/main`);
        const unsubscribeBudgets = onSnapshot(budgetDocRef, (docSnapshot) => {
            setBudgets(docSnapshot.exists() ? docSnapshot.data() : {});
        });
        return () => { unsubscribeTrans(); unsubscribeBudgets(); };
    }, [user]);

    const { income, expense, total } = useMemo(() => {
        const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, total: income + expense };
    }, [transactions]);

    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    const handleAddTransaction = async (transactionData) => {
        if (!user) return;
        await addDoc(collection(db, `users/${user.uid}/transactions`), { ...transactionData, createdAt: serverTimestamp() });
        setActiveView('history');
    };

    const handleDeleteTransaction = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
    };

    const handleSetBudgets = async (newBudgets) => {
        if (!user) return;
        await setDoc(doc(db, `users/${user.uid}/budgets/main`), newBudgets);
        alert('Đã lưu ngân sách thành công!');
    };

    const handleAnalyzeSpending = async () => {
        if (transactions.filter(t => t.amount < 0).length === 0) {
            setError('Không có giao dịch CHI TIÊU nào để phân tích.');
            setAnalysis('');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        const transactionList = transactions.map(t => `- ${t.text}: ${formatCurrency(t.amount)}${t.category ? ` (Hạng mục: ${t.category})` : ''}`).join('\n');
        const prompt = `Với vai trò là một chuyên gia tài chính cá nhân, hãy phân tích danh sách giao dịch sau của người dùng Việt Nam. Dựa vào dữ liệu, hãy:
1. Đưa ra nhận xét tổng quan về tình hình tài chính.
2. Xác định các hạng mục chi tiêu lớn nhất và phân tích xem có điểm nào bất thường không.
3. Đưa ra 2-3 lời khuyên cụ thể, hữu ích để giúp họ tối ưu hóa chi tiêu.
Vui lòng trả lời bằng tiếng Việt, giọng văn khích lệ, và sử dụng định dạng HTML (<strong>, <ul>, <li>, <p>).
Dữ liệu giao dịch:
${transactionList}`;

        try {
            // **QUAN TRỌNG: Thay API Key của bạn vào đây**
            const apiKey = "AIzaSyDeOMmzZGTL1x10vK1UIY1UBd3apUCRvFw"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            setAnalysis(result.candidates[0].content.parts[0].text);
        } catch (err) {
            console.error("Error calling Gemini API:", err);
            setError("Rất tiếc, đã có lỗi khi kết nối với chuyên gia AI. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderView = () => {
        if (authError) { return <div className="w-full text-center p-10 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-xl"><h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">Lỗi Kết Nối</h2><p className="text-red-600 dark:text-red-400 font-medium">{authError}</p><p className="mt-4 text-slate-600 dark:text-slate-400">Vui lòng kiểm tra lại cấu hình và tải lại trang.</p></div>; }
        if (!user) { return <div className="w-full text-center p-10"><p className="animate-pulse font-medium text-slate-500 dark:text-slate-400">Đang kết nối đến máy chủ...</p></div>; }
        switch (activeView) {
            case 'history': return <HistoryView transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />;
            case 'add': return <AddTransactionView onAddTransaction={handleAddTransaction} />;
            case 'budget': return <BudgetView income={income} budgets={budgets} onSetBudgets={handleSetBudgets} formatCurrency={formatCurrency} />;
            case 'statistics': return <StatisticsView transactions={transactions} formatCurrency={formatCurrency} />;
            case 'dashboard':
            default: return <DashboardView transactions={transactions} income={income} expense={expense} total={total} budgets={budgets} handleAnalyzeSpending={handleAnalyzeSpending} analysis={analysis} isLoading={isLoading} error={error} formatCurrency={formatCurrency} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans">
            <style>{`
                .react-datepicker-wrapper input { width: 100%; cursor: pointer; }
                .react-datepicker { font-family: inherit; border-color: #cbd5e1; }
                .react-datepicker__header { background-color: #f1f5f9; border-bottom-color: #cbd5e1; }
                .dark .react-datepicker { background-color: #1e293b; border-color: #475569; }
                .dark .react-datepicker__header { background-color: #334155; border-bottom-color: #475569; }
                .dark .react-datepicker__day-name, .dark .react-datepicker__day, .dark .react-datepicker__current-month { color: #e2e8f0; }
                .dark .react-datepicker__day:hover, .dark .react-datepicker__day--keyboard-selected { background-color: #475569; }
                .dark .react-datepicker__day--selected, .dark .react-datepicker__day--in-selecting-range, .dark .react-datepicker__day--in-range { background-color: #4f46e5; }
                .dark .react-datepicker__day--disabled { color: #64748b; }
            `}</style>
            <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
}