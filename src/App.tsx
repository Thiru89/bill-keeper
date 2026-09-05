/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { SpendingDashboard } from './components/SpendingDashboard';
import { BookkeepingList } from './components/BookkeepingList';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { SettingsModal } from './components/SettingsModal';
import { BillItem, BiometricStatus } from './types';
import {
  fetchBillsWithFallback,
  saveBillRecord,
  deleteBillRecord,
  syncOfflineQueue,
  getOfflineQueue,
  isNetworkOffline,
} from './utils/storage';
import { getBiometricSettings } from './utils/biometrics';
import {
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookkeeping'>('dashboard');

  // Phone Frame vs Full Screen responsive layout
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Modals & Sheets
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(
    null
  );

  // Biometric security
  const [biometrics, setBiometrics] = useState<BiometricStatus>(getBiometricSettings());
  const [isLocked, setIsLocked] = useState(biometrics.isEnabled && biometrics.isLocked);

  // Pending queue count
  const [pendingSyncCount, setPendingSyncCount] = useState(getOfflineQueue().length);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load bills from cloud / cache
  const loadBills = useCallback(async () => {
    setIsLoading(true);
    try {
      const { bills: loadedBills, isFromCache } = await fetchBillsWithFallback();
      setBills(loadedBills);
      setPendingSyncCount(getOfflineQueue().length);
      if (isFromCache && isNetworkOffline()) {
        showToast('Offline Mode: Loaded records from local storage', 'info');
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();

    // Listen to network changes for auto-sync
    const handleNetworkChange = async () => {
      const offline = isNetworkOffline();
      if (!offline) {
        // Online: attempt to auto-sync pending queue
        const syncResult = await syncOfflineQueue();
        if (syncResult.syncedCount > 0) {
          showToast(`Synced ${syncResult.syncedCount} queued bills to Cloud Database!`, 'success');
          loadBills();
        }
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('billkeeper_network_change', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('billkeeper_network_change', handleNetworkChange);
    };
  }, [loadBills]);

  // Handle Save Bill from Scanner
  const handleSaveBill = async (newBill: BillItem) => {
    const { bill: saved, isQueuedOffline } = await saveBillRecord(newBill);
    setBills((prev) => {
      const existing = prev.findIndex((b) => b.id === saved.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setPendingSyncCount(getOfflineQueue().length);

    if (isQueuedOffline) {
      showToast('Bill queued in local storage for cloud sync!', 'warn');
    } else {
      showToast(`Saved bill from ${saved.merchant} to cloud database!`, 'success');
    }
  };

  // Handle Delete Bill
  const handleDeleteBill = async (id: string) => {
    await deleteBillRecord(id);
    setBills((prev) => prev.filter((b) => b.id !== id));
    setPendingSyncCount(getOfflineQueue().length);
    showToast('Bill record deleted successfully', 'info');
  };

  // Lock App
  const handleLockApp = () => {
    setIsLocked(true);
  };

  // Unlock Success
  const handleUnlockSuccess = () => {
    setIsLocked(false);
    showToast('Biometric Access Verified', 'success');
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#050505] text-[#F0F0F0] flex flex-col items-center justify-start antialiased selection:bg-[#00F2FF] selection:text-black font-sans relative overflow-x-hidden"
    >
      {/* IMMERSIVE UI AMBIENT GLOW ORBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#00F2FF22] blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#CCFF0011] blur-[130px] rounded-full"></div>
      </div>

      {/* BIOMETRIC LOCK SCREEN OVERLAY */}
      {isLocked && (
        <BiometricLockScreen
          onUnlockSuccess={handleUnlockSuccess}
          pinCode={biometrics.pinCode}
        />
      )}

      {/* TOAST FEEDBACK BANNER */}
      {toastMsg && (
        <div
          id="app-toast-feedback"
          className={`fixed top-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold tracking-wide border transition-all animate-bounce ${
            toastMsg.type === 'success'
              ? 'bg-[#CCFF00] text-black border-[#CCFF00]/40 shadow-[0_0_20px_rgba(204,255,0,0.4)]'
              : toastMsg.type === 'warn'
              ? 'bg-amber-400 text-black border-amber-500/40 shadow-lg'
              : 'bg-white/10 text-[#00F2FF] border border-[#00F2FF44] backdrop-blur-md shadow-[0_0_20px_rgba(0,242,255,0.3)]'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-black" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* WRAPPER: Responsive or Android Phone Frame */}
      <div
        id="app-frame-wrapper"
        className={`w-full transition-all duration-300 flex flex-col relative z-10 ${
          isPhoneFrame
            ? 'max-w-[430px] my-4 rounded-[42px] border-[10px] border-[#181d28] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden min-h-[840px] max-h-[92vh] bg-[#050505]'
            : 'max-w-4xl min-h-screen bg-[#050505]/95 border-x border-white/10 backdrop-blur-sm'
        }`}
      >
        {/* Android Status Bar with Clock, Battery, Wifi & Actions */}
        <AndroidStatusBar
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          onLockApp={handleLockApp}
          pendingSyncCount={pendingSyncCount}
        />

        {/* Immersive UI Top App Bar */}
        <header
          id="material-app-bar"
          className="px-5 py-3.5 bg-white/5 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00F2FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.45)] text-black">
              <Receipt className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  BILLSCAN<span className="text-[#00F2FF]">PRO</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F2FF22] text-[#00F2FF] border border-[#00F2FF44] font-bold tracking-wider uppercase">
                  OCR AI
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5 font-medium">
                Automated Bookkeeping & Encrypted Sync
              </p>
            </div>
          </div>

          {/* Quick Scan Action Button - Immersive UI Volt Accent */}
          <button
            id="btn-header-quick-scan"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-[0_0_20px_rgba(204,255,0,0.35)] transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Scan Bill</span>
          </button>
        </header>

        {/* Main Content Area */}
        <main
          id="main-content-scrollable"
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 relative"
        >
          {isLoading ? (
            <div
              id="app-loading-state"
              className="flex flex-col items-center justify-center py-20 text-white/40 space-y-3"
            >
              <RefreshCw className="w-8 h-8 text-[#00F2FF] animate-spin shadow-[0_0_15px_#00F2FF44]" />
              <p className="text-xs font-mono text-white/60">Synchronizing cloud database records...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <SpendingDashboard
                  bills={bills}
                  onOpenScanner={() => setIsScannerOpen(true)}
                  onSelectCategoryFilter={(cat) => {
                    setSelectedCategory(cat);
                    setActiveTab('bookkeeping');
                  }}
                />
              )}

              {activeTab === 'bookkeeping' && (
                <BookkeepingList
                  bills={bills}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onDeleteBill={handleDeleteBill}
                  onOpenScanner={() => setIsScannerOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Android / Flutter Material Navigation Bar */}
        <AndroidBottomNav
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* RECEIPT SCANNER & OCR MODAL */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveBill={handleSaveBill}
      />

      {/* SETTINGS & OFFLINE MANAGER MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        biometrics={biometrics}
        onUpdateBiometrics={(updated) => setBiometrics(updated)}
        onSyncTriggered={() => loadBills()}
        billsCount={bills.length}
      />
    </div>
  );
}
