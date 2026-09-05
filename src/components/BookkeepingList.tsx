/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  CloudCheck,
  CloudOff,
  Clock,
  ChevronDown,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Receipt,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { BillItem, BillCategory } from '../types';
import { CATEGORIES, ALL_CATEGORIES } from '../data/categories';

interface BookkeepingListProps {
  bills: BillItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onDeleteBill: (id: string) => Promise<void>;
  onOpenScanner: () => void;
}

export const BookkeepingList: React.FC<BookkeepingListProps> = ({
  bills,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onDeleteBill,
  onOpenScanner,
}) => {
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<BillItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter and sort bills
  const filteredBills = useMemo(() => {
    let list = [...bills];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const matchMerchant = b.merchant?.toLowerCase().includes(q);
        const matchCategory = b.category?.toLowerCase().includes(q);
        const matchNotes = b.notes?.toLowerCase().includes(q);
        const matchRaw = b.rawText?.toLowerCase().includes(q);
        const matchItems = b.lineItems?.some((item) =>
          item.description?.toLowerCase().includes(q)
        );
        const matchAmount = b.totalAmount?.toString().includes(q);
        return matchMerchant || matchCategory || matchNotes || matchRaw || matchItems || matchAmount;
      });
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((b) => b.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'amount-desc') {
      list.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    } else if (sortBy === 'amount-asc') {
      list.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    } else if (sortBy === 'date-asc') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [bills, searchQuery, selectedCategory, sortBy]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBills.length === 0) return;

    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Total Amount', 'Tax', 'Payment Method', 'Notes'];
    const rows = filteredBills.map((b) => [
      b.id,
      b.date,
      `"${b.merchant.replace(/"/g, '""')}"`,
      b.category,
      b.totalAmount,
      b.taxAmount || 0,
      `"${(b.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookkeeping_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="bookkeeping-list-container" className="space-y-4 pb-12">
      {/* Search Bar & Export */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
          <input
            id="bookkeeping-search-input"
            type="text"
            placeholder="Search merchants, line items, notes, amounts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00F2FF] transition-colors backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-white/40 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Export controls */}
        <div className="flex items-center gap-2">
          <select
            id="sort-bills-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-[#00F2FF] backdrop-blur-md"
          >
            <option value="date-desc" className="bg-[#0e1424] text-white">Newest Date</option>
            <option value="date-asc" className="bg-[#0e1424] text-white">Oldest Date</option>
            <option value="amount-desc" className="bg-[#0e1424] text-white">Highest Amount</option>
            <option value="amount-asc" className="bg-[#0e1424] text-white">Lowest Amount</option>
          </select>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            title="Export bookkeeping data to CSV"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 border border-white/10 hover:border-[#00F2FF44] rounded-2xl text-xs font-semibold text-white/70 hover:text-[#00F2FF] transition-colors backdrop-blur-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Horizontal scrolling) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          id="filter-category-all"
          onClick={() => onSelectCategory('All')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#CCFF00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.35)]'
              : 'bg-white/5 text-white/50 hover:text-white border border-white/5 backdrop-blur-sm'
          }`}
        >
          All Categories ({bills.length})
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const count = bills.filter((b) => b.category === cat).length;
          const meta = CATEGORIES[cat];
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              id={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
              }`}
              style={
                isSelected
                  ? { backgroundColor: meta.color, boxShadow: `0 0 15px ${meta.color}66` }
                  : { borderColor: meta.borderColor }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: meta.color }}
              ></span>
              <span>{cat}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-white/50 font-mono px-1">
        <span>
          Showing {filteredBills.length} of {bills.length} stored bills
        </span>
        <span className="text-[#00F2FF] font-bold">
          Sum: ${filteredBills.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0).toFixed(2)}
        </span>
      </div>

      {/* Bills Cards List */}
      {filteredBills.length === 0 ? (
        <div
          id="empty-bookkeeping-state"
          className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl space-y-3 backdrop-blur-md"
        >
          <Receipt className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookkeeping Records Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {searchQuery
              ? `No bills match "${searchQuery}". Try clearing search or category filters.`
              : 'Scan your first bill screenshot or photo to extract and store bookkeeping records.'}
          </p>
          <button
            onClick={onOpenScanner}
            className="mt-2 px-4 py-2 bg-[#CCFF00] text-black font-bold rounded-xl text-xs hover:bg-[#b8e600] transition-colors inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
          >
            Scan Bill Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredBills.map((bill) => {
            const catMeta = CATEGORIES[bill.category] || CATEGORIES.Others;

            return (
              <div
                key={bill.id}
                id={`bill-card-${bill.id}`}
                onClick={() => setSelectedBillForDetail(bill)}
                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F2FF55] rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-between gap-3 group backdrop-blur-md hover:shadow-[0_0_20px_rgba(0,242,255,0.1)]"
              >
                {/* Left: Category color indicator & Merchant info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                    style={{
                      backgroundColor: catMeta.bgColor,
                      border: `1px solid ${catMeta.borderColor}`,
                      color: catMeta.color,
                      boxShadow: `0 0 10px ${catMeta.color}33`,
                    }}
                  >
                    {bill.merchant.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00F2FF] transition-colors">
                        {bill.merchant}
                      </h4>
                      {bill.status === 'pending_sync' ? (
                        <span
                          title="Queued in local storage for cloud sync"
                          className="flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>QUEUED</span>
                        </span>
                      ) : (
                        <span
                          title="Synced to cloud database"
                          className="flex items-center gap-1 text-[9px] font-mono text-[#00F2FF] opacity-90"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                      <span className="font-mono text-[11px]">{bill.date}</span>
                      <span>•</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          backgroundColor: catMeta.bgColor,
                          color: catMeta.color,
                        }}
                      >
                        {bill.category}
                      </span>
                      {bill.lineItems && bill.lineItems.length > 0 && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-[11px] text-white/50 truncate max-w-[140px]">
                            {bill.lineItems.length} items
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Total Amount & Action */}
                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  <div>
                    <div className="text-base font-black font-mono text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]">
                      ${bill.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {bill.paymentMethod || 'Card'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBillForDetail(bill);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED BILL MODAL */}
      {selectedBillForDetail && (
        <div
          id="bill-detail-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            id="bill-detail-card"
            className="w-full max-w-md bg-[#080808]/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <span className="text-[10px] font-mono text-[#00F2FF] uppercase tracking-wider">
                  Bookkeeping Record
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {selectedBillForDetail.merchant}
                </h3>
              </div>

              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Top Amount Banner */}
              <div className="p-4 rounded-2xl bg-white/5 border border-[#00F2FF44] flex items-center justify-between shadow-[0_0_20px_rgba(0,242,255,0.08)]">
                <div>
                  <span className="text-[11px] font-mono text-white/50">Total Charged</span>
                  <div className="text-2xl font-black font-mono text-[#00F2FF] drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                    ${selectedBillForDetail.totalAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    Tax: ${(selectedBillForDetail.taxAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor:
                        CATEGORIES[selectedBillForDetail.category]?.bgColor || 'rgba(255,255,255,0.1)',
                      color: CATEGORIES[selectedBillForDetail.category]?.color || '#ffffff',
                    }}
                  >
                    {selectedBillForDetail.category}
                  </span>
                  <div className="mt-2 text-[10px] font-mono text-white/50">
                    {selectedBillForDetail.date}
                  </div>
                </div>
              </div>

              {/* Receipt photo if available */}
              {selectedBillForDetail.imageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-white/50">Scanned Bill Media</span>
                  <div className="rounded-2xl overflow-hidden border border-white/10 max-h-48 flex items-center justify-center bg-black">
                    <img
                      src={selectedBillForDetail.imageUrl}
                      alt="Bill receipt"
                      className="w-full h-auto object-contain max-h-48"
                    />
                  </div>
                </div>
              )}

              {/* Itemized Line Items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white">
                  Line Items ({selectedBillForDetail.lineItems?.length || 0})
                </span>

                {selectedBillForDetail.lineItems && selectedBillForDetail.lineItems.length > 0 ? (
                  <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                    {selectedBillForDetail.lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-white/5 last:border-0"
                      >
                        <span className="text-white/80 font-medium">
                          {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}
                          {item.description}
                        </span>
                        <span className="font-mono text-[#00F2FF]">
                          ${Number(item.total).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 italic text-[11px]">
                    No individual line items itemized.
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 font-mono text-[11px]">
                <div>
                  <span className="text-white/40 block">Payment Method</span>
                  <span className="text-white/80">{selectedBillForDetail.paymentMethod || 'Card'}</span>
                </div>
                <div>
                  <span className="text-white/40 block">OCR Confidence</span>
                  <span className="text-[#00F2FF]">{selectedBillForDetail.confidenceScore || 95}%</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-white/5">
                  <span className="text-white/40 block">Notes / Reference</span>
                  <span className="text-white/70">{selectedBillForDetail.notes || 'None'}</span>
                </div>
              </div>

              {/* Raw OCR Text Audit */}
              {selectedBillForDetail.rawText && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-white/40">Raw OCR Snippet:</span>
                  <div className="p-2 bg-black/60 rounded-xl font-mono text-[10px] text-white/50 whitespace-pre-line border border-white/5">
                    {selectedBillForDetail.rawText}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
              {deleteConfirmId === selectedBillForDetail.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await onDeleteBill(selectedBillForDetail.id);
                      setSelectedBillForDetail(null);
                      setDeleteConfirmId(null);
                    }}
                    className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-1.5 bg-white/10 text-white/70 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selectedBillForDetail.id)}
                  className="px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl flex items-center gap-1.5 transition-colors text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Bill</span>
                </button>
              )}

              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
