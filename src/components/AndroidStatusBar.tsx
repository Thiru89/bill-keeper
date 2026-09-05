/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, Lock, Smartphone, Maximize2, ShieldCheck } from 'lucide-react';
import { isNetworkOffline } from '../utils/storage';

interface AndroidStatusBarProps {
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  onLockApp: () => void;
  pendingSyncCount: number;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isPhoneFrame,
  onToggleFrame,
  onLockApp,
  pendingSyncCount,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const checkNet = () => setOffline(isNetworkOffline());
    checkNet();

    window.addEventListener('online', checkNet);
    window.addEventListener('offline', checkNet);
    window.addEventListener('billkeeper_network_change', checkNet);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkNet);
      window.removeEventListener('offline', checkNet);
      window.removeEventListener('billkeeper_network_change', checkNet);
    };
  }, []);

  return (
    <div
      id="android-status-bar"
      className="w-full bg-[#050505]/90 backdrop-blur-md px-5 py-2 flex items-center justify-between text-xs text-white/70 select-none border-b border-white/10 font-mono tracking-wider z-30"
    >
      {/* Left: Clock & Network Indicator */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-white text-sm tracking-tight font-sans">{timeStr}</span>
        {offline ? (
          <span
            id="status-offline-badge"
            className="flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium"
          >
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span>OFFLINE</span>
          </span>
        ) : (
          <span
            id="status-online-badge"
            className="flex items-center gap-1.5 bg-[#00F2FF22] text-[#00F2FF] border border-[#00F2FF44] px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shadow-[0_0_10px_#00F2FF22]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] animate-pulse"></span>
            <span>CLOUD SYNC</span>
          </span>
        )}
      </div>

      {/* Right: Actions, Frame Toggle, Battery & Quick Lock */}
      <div className="flex items-center space-x-3">
        {pendingSyncCount > 0 && (
          <span
            id="pending-sync-counter"
            title={`${pendingSyncCount} bills queued locally for sync`}
            className="bg-[#CCFF00] text-black px-2 py-0.5 rounded-full text-[10px] font-bold shadow-[0_0_10px_rgba(204,255,0,0.3)]"
          >
            {pendingSyncCount} queued
          </span>
        )}

        <button
          id="btn-quick-lock"
          onClick={onLockApp}
          title="Lock app with Biometrics"
          className="p-1 hover:text-[#00F2FF] hover:bg-white/5 rounded transition-colors text-white/60 flex items-center gap-1"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-sans">Lock</span>
        </button>

        <button
          id="btn-toggle-frame"
          onClick={onToggleFrame}
          title={isPhoneFrame ? 'Switch to Full-Screen View' : 'Switch to Android Mobile Frame'}
          className="p-1 hover:text-[#CCFF00] hover:bg-white/5 rounded transition-colors text-white/60 flex items-center gap-1"
        >
          {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px] font-sans">
            {isPhoneFrame ? 'Full' : 'Phone'}
          </span>
        </button>

        {offline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Wifi className="w-3.5 h-3.5 text-white/80" />
        )}

        <div className="flex items-center space-x-0.5 text-white/80">
          <span className="text-[10px]">88%</span>
          <Battery className="w-4 h-4 text-[#CCFF00]" />
        </div>
      </div>
    </div>
  );
};
