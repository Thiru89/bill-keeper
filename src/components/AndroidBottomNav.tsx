/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, ReceiptText, Camera, SlidersHorizontal } from 'lucide-react';

interface AndroidBottomNavProps {
  currentTab: 'dashboard' | 'bookkeeping';
  onSelectTab: (tab: 'dashboard' | 'bookkeeping') => void;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  onOpenSettings,
}) => {
  return (
    <div
      id="android-bottom-navigation"
      className="w-full bg-[#050505]/90 backdrop-blur-md border-t border-white/10 pt-2 pb-5 px-6 flex items-center justify-around z-30 select-none"
    >
      {/* Tab: Dashboard */}
      <button
        id="nav-tab-dashboard"
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 transition-all ${
          currentTab === 'dashboard' ? 'text-[#00F2FF]' : 'text-white/50 hover:text-white'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'bg-[#00F2FF22] border border-[#00F2FF44] shadow-[0_0_15px_#00F2FF33]'
              : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold tracking-tight">Dashboard</span>
      </button>

      {/* Center FAB: Scan Bill */}
      <button
        id="nav-fab-scan-bill"
        onClick={onOpenScanner}
        title="Scan Bill or Receipt with AI OCR"
        className="relative -top-3 w-14 h-14 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-[0_0_25px_rgba(204,255,0,0.5)] hover:bg-[#b8e600] hover:scale-105 active:scale-95 transition-all border-2 border-black group"
      >
        <Camera className="w-6 h-6 text-black group-hover:rotate-6 transition-transform" />
      </button>

      {/* Tab: Bookkeeping Records */}
      <button
        id="nav-tab-bookkeeping"
        onClick={() => onSelectTab('bookkeeping')}
        className={`flex flex-col items-center gap-1 transition-all ${
          currentTab === 'bookkeeping' ? 'text-[#00F2FF]' : 'text-white/50 hover:text-white'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            currentTab === 'bookkeeping'
              ? 'bg-[#00F2FF22] border border-[#00F2FF44] shadow-[0_0_15px_#00F2FF33]'
              : ''
          }`}
        >
          <ReceiptText className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold tracking-tight">Bookkeeping</span>
      </button>

      {/* Action: Settings */}
      <button
        id="nav-tab-settings"
        onClick={onOpenSettings}
        className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-all"
      >
        <div className="p-1.5 rounded-xl hover:bg-white/10">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold tracking-tight">Settings</span>
      </button>
    </div>
  );
};
