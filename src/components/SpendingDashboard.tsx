/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Wallet,
  Target,
} from 'lucide-react';
import { BillItem, BillCategory } from '../types';
import { CATEGORIES, ALL_CATEGORIES } from '../data/categories';

interface SpendingDashboardProps {
  bills: BillItem[];
  onOpenScanner: () => void;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const SpendingDashboard: React.FC<SpendingDashboardProps> = ({
  bills,
  onOpenScanner,
  onSelectCategoryFilter,
}) => {
  // Available distinct months from bills data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    set.add(currentMonthKey);

    bills.forEach((b) => {
      if (b.date) {
        set.add(b.date.substring(0, 7));
      }
    });

    return Array.from(set).sort().reverse();
  }, [bills]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || new Date().toISOString().substring(0, 7)
  );

  const [monthlyBudget, setMonthlyBudget] = useState<number>(850);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter bills for selected month
  const currentMonthBills = useMemo(() => {
    return bills.filter((b) => b.date && b.date.startsWith(selectedMonth));
  }, [bills, selectedMonth]);

  // Previous month bills for comparison
  const previousMonthKey = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const prevDate = new Date(year, month - 2, 1);
    return prevDate.toISOString().substring(0, 7);
  }, [selectedMonth]);

  const prevMonthBills = useMemo(() => {
    return bills.filter((b) => b.date && b.date.startsWith(previousMonthKey));
  }, [bills, previousMonthKey]);

  // Spending Totals
  const totalSpent = useMemo(() => {
    return currentMonthBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  }, [currentMonthBills]);

  const prevTotalSpent = useMemo(() => {
    return prevMonthBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  }, [prevMonthBills]);

  const spendingDiffPercent = useMemo(() => {
    if (prevTotalSpent === 0) return 0;
    return Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100);
  }, [totalSpent, prevTotalSpent]);

  const avgPerTransaction = useMemo(() => {
    if (currentMonthBills.length === 0) return 0;
    return totalSpent / currentMonthBills.length;
  }, [totalSpent, currentMonthBills]);

  const largestBill = useMemo(() => {
    if (currentMonthBills.length === 0) return null;
    return [...currentMonthBills].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))[0];
  }, [currentMonthBills]);

  // Category totals & distribution
  const categoryStats = useMemo(() => {
    const totals: Record<string, { amount: number; count: number }> = {};
    ALL_CATEGORIES.forEach((c) => {
      totals[c] = { amount: 0, count: 0 };
    });

    currentMonthBills.forEach((b) => {
      const cat = b.category || 'Others';
      if (!totals[cat]) {
        totals[cat] = { amount: 0, count: 0 };
      }
      totals[cat].amount += Number(b.totalAmount) || 0;
      totals[cat].count += 1;
    });

    // Sort by amount descending
    return Object.entries(totals)
      .map(([category, data]) => ({
        category: category as BillCategory,
        amount: data.amount,
        count: data.count,
        percent: totalSpent > 0 ? Math.round((data.amount / totalSpent) * 100) : 0,
        meta: CATEGORIES[category as BillCategory] || CATEGORIES.Others,
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthBills, totalSpent]);

  // Daily Spending distribution for the month
  const dailySpending = useMemo(() => {
    const daysMap: Record<number, number> = {};
    for (let d = 1; d <= 31; d++) {
      daysMap[d] = 0;
    }

    currentMonthBills.forEach((b) => {
      if (b.date) {
        const day = parseInt(b.date.split('-')[2], 10);
        if (day && daysMap[day] !== undefined) {
          daysMap[day] += Number(b.totalAmount) || 0;
        }
      }
    });

    const maxDayAmount = Math.max(...Object.values(daysMap), 10);

    return {
      days: Object.entries(daysMap).map(([day, amount]) => ({
        day: parseInt(day, 10),
        amount,
        heightPercent: Math.min(100, Math.round((amount / maxDayAmount) * 100)),
      })),
      maxAmount: maxDayAmount,
    };
  }, [currentMonthBills]);

  // Format month name
  const formattedMonthName = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // Navigate month
  const handlePrevMonth = () => {
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (currentIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(availableMonths[currentIndex - 1]);
    }
  };

  // SVG Donut Chart calculation
  const donutSegments = useMemo(() => {
    let cumulativePercent = 0;
    const radius = 68;
    const circumference = 2 * Math.PI * radius;

    return categoryStats.map((item) => {
      const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += item.percent;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryStats]);

  // Budget progress
  const budgetProgress = useMemo(() => {
    if (monthlyBudget <= 0) return 0;
    return Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));
  }, [totalSpent, monthlyBudget]);

  const budgetRemaining = Math.max(0, monthlyBudget - totalSpent);

  return (
    <div id="spending-dashboard-container" className="space-y-4 pb-6">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#00F2FF]" />
          <span className="text-xs font-mono uppercase tracking-wider text-white/50">
            Monthly Analysis
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-prev-month"
            onClick={handlePrevMonth}
            disabled={availableMonths.indexOf(selectedMonth) >= availableMonths.length - 1}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            id="selected-month-label"
            className="text-sm font-bold text-white min-w-[140px] text-center"
          >
            {formattedMonthName}
          </span>

          <button
            id="btn-next-month"
            onClick={handleNextMonth}
            disabled={availableMonths.indexOf(selectedMonth) <= 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Spent Hero Card */}
        <div
          id="card-total-spent"
          className="col-span-2 bg-white/5 border border-[#00F2FF44] p-5 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,242,255,0.08)]"
        >
          <div className="absolute right-0 top-0 w-36 h-36 bg-[#00F2FF18] rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Total Spent</span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {spendingDiffPercent > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-rose-400" />
                  <span className="text-rose-400 font-bold">+{spendingDiffPercent}%</span>
                </>
              ) : spendingDiffPercent < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 text-[#CCFF00]" />
                  <span className="text-[#CCFF00] font-bold">{spendingDiffPercent}%</span>
                </>
              ) : (
                <span className="text-white/40">0%</span>
              )}
            </span>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#00F2FF] tracking-tight drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">
            ${totalSpent.toFixed(2)}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
            <span>{currentMonthBills.length} bills processed</span>
            <span>Prev Month: ${prevTotalSpent.toFixed(2)}</span>
          </div>
        </div>

        {/* Avg per Bill */}
        <div
          id="card-avg-bill"
          className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-between backdrop-blur-md shadow-lg"
        >
          <span className="text-xs font-mono uppercase text-white/50">Average Bill</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${avgPerTransaction.toFixed(2)}
          </div>
          <span className="text-[10px] text-white/40 mt-2 font-mono">per transaction</span>
        </div>

        {/* Largest Single Expense */}
        <div
          id="card-largest-bill"
          className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-between backdrop-blur-md shadow-lg"
        >
          <span className="text-xs font-mono uppercase text-white/50">Largest Bill</span>
          <div className="text-xl font-bold font-mono text-[#CCFF00] mt-1 truncate">
            {largestBill ? `$${largestBill.totalAmount.toFixed(2)}` : '$0.00'}
          </div>
          <span className="text-[10px] text-white/40 mt-2 truncate">
            {largestBill ? largestBill.merchant : 'None recorded'}
          </span>
        </div>
      </div>

      {/* Monthly Budget Target Progress Bar */}
      <div
        id="budget-tracker-card"
        className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-lg space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-xs font-bold text-white tracking-wide">Monthly Budget</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-mono">Target:</span>
            <div className="flex items-center bg-black/50 px-2 py-0.5 rounded-lg border border-white/10">
              <span className="text-xs text-[#00F2FF] font-bold font-mono">$</span>
              <input
                id="input-monthly-budget"
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                className="w-16 bg-transparent text-xs font-mono font-bold text-white text-right focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetProgress > 95
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                  : budgetProgress > 75
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                  : 'bg-gradient-to-r from-[#00F2FF] to-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.5)]'
              }`}
              style={{ width: `${budgetProgress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1">
            <span>{budgetProgress}% consumed</span>
            <span className={budgetRemaining === 0 ? 'text-rose-400 font-bold' : 'text-[#CCFF00]'}>
              {budgetRemaining > 0 ? `$${budgetRemaining.toFixed(2)} remaining` : 'Budget Exceeded'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Split: Donut Chart & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interactive SVG Donut Chart */}
        <div
          id="category-chart-card"
          className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center relative"
        >
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-[#00F2FF]" />
              Category Breakdown
            </span>
            <span className="text-[11px] font-mono text-white/40">
              {categoryStats.length} active categories
            </span>
          </div>

          {currentMonthBills.length === 0 ? (
            <div className="py-12 text-white/40 text-xs">
              <Receipt className="w-10 h-10 mx-auto text-white/20 mb-2" />
              No bills recorded for {formattedMonthName}.
            </div>
          ) : (
            <div className="relative my-4 flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="16"
                />

                {/* Slices */}
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.category}
                    cx="80"
                    cy="80"
                    r="68"
                    fill="transparent"
                    stroke={segment.meta.color}
                    strokeWidth={hoveredCategory === segment.category ? 20 : 16}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(segment.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase text-white/50">
                  {hoveredCategory || 'Total Spent'}
                </span>
                <span className="text-base font-bold font-mono text-white mt-0.5">
                  $
                  {hoveredCategory
                    ? (
                        categoryStats.find((c) => c.category === hoveredCategory)?.amount || 0
                      ).toFixed(2)
                    : totalSpent.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-[#00F2FF]">
                  {hoveredCategory
                    ? `${
                        categoryStats.find((c) => c.category === hoveredCategory)?.percent || 0
                      }%`
                    : `${currentMonthBills.length} bills`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Category List with High-Contrast Bars */}
        <div
          id="category-breakdown-list"
          className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-lg space-y-3 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white">Top Spending Categories</span>
            <span className="text-[10px] text-white/40 font-mono">Sorted by spend</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {categoryStats.map((item) => (
              <div
                key={item.category}
                id={`cat-stat-${item.category.toLowerCase().replace(/\s+/g, '-')}`}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(item.category)}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                  hoveredCategory === item.category
                    ? 'bg-white/10 border-white/20 scale-[1.01]'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: item.meta.color, color: item.meta.color }}
                    ></span>
                    <span className="font-semibold text-white">{item.category}</span>
                    <span className="text-[10px] text-white/40 font-mono">
                      ({item.count} {item.count === 1 ? 'bill' : 'bills'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white">${item.amount.toFixed(2)}</span>
                    <span className="text-[11px] text-white/40 min-w-[32px] text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.meta.color,
                      boxShadow: `0 0 10px ${item.meta.color}55`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <span>Tap category to filter bookkeeping records</span>
            <span className="text-[#00F2FF] font-mono">100% categorized</span>
          </div>
        </div>
      </div>

      {/* Monthly Daily Timeline Activity Pattern */}
      <div
        id="daily-spending-chart-card"
        className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-lg space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white">Daily Spending Rhythm</span>
            <p className="text-[11px] text-white/50">
              Days 1 through 31 spending pattern for {formattedMonthName}
            </p>
          </div>
          <span className="text-xs font-mono text-[#00F2FF] font-bold">
            Peak Day: ${dailySpending.maxAmount.toFixed(2)}
          </span>
        </div>

        {/* Daily Bars */}
        <div className="pt-4 flex items-end justify-between gap-1 h-28 border-b border-white/10 px-1">
          {dailySpending.days.map((d) => (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
            >
              {/* Tooltip on hover */}
              {d.amount > 0 && (
                <div className="absolute -top-8 bg-black text-[#00F2FF] font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#00F2FF44] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-[0_0_15px_#00F2FF33]">
                  Day {d.day}: ${d.amount.toFixed(2)}
                </div>
              )}

              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  d.amount > 0
                    ? 'bg-[#00F2FF] hover:bg-[#CCFF00] group-hover:scale-y-105 shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                    : 'bg-white/5 hover:bg-white/15'
                }`}
                style={{
                  height: `${Math.max(6, d.heightPercent)}%`,
                }}
              ></div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[10px] font-mono text-white/40 px-1 pt-1">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span>Day 31</span>
        </div>
      </div>
    </div>
  );
};
