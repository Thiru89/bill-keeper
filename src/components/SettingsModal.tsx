/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  WifiOff,
  Wifi,
  KeyRound,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  X,
  Lock,
  Smartphone,
  Info,
} from 'lucide-react';
import { BiometricStatus } from '../types';
import { saveBiometricSettings, triggerWebAuthnChallenge } from '../utils/biometrics';
import {
  getSimulatedOffline,
  setSimulatedOffline,
  syncOfflineQueue,
  getOfflineQueue,
} from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  biometrics: BiometricStatus;
  onUpdateBiometrics: (updated: BiometricStatus) => void;
  onSyncTriggered: () => void;
  billsCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  biometrics,
  onUpdateBiometrics,
  onSyncTriggered,
  billsCount,
}) => {
  const [offlineSimulated, setOfflineSimulated] = useState(getSimulatedOffline());
  const [newPin, setNewPin] = useState(biometrics.pinCode || '1234');
  const [pinSaved, setPinSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [bioTestMsg, setBioTestMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleBiometrics = () => {
    const updated = saveBiometricSettings({
      isEnabled: !biometrics.isEnabled,
    });
    onUpdateBiometrics(updated);
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      const updated = saveBiometricSettings({ pinCode: newPin });
      onUpdateBiometrics(updated);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  const handleTestBiometric = async () => {
    setBioTestMsg('Testing platform biometrics...');
    const result = await triggerWebAuthnChallenge();
    if (result.success) {
      setBioTestMsg('Biometrics verified successfully!');
    } else {
      setBioTestMsg(result.error || 'Biometric test failed');
    }
    setTimeout(() => setBioTestMsg(''), 3000);
  };

  const handleToggleOfflineMode = () => {
    const nextVal = !offlineSimulated;
    setOfflineSimulated(nextVal);
    setSimulatedOffline(nextVal);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMsg('');
    const res = await syncOfflineQueue();
    setIsSyncing(false);
    if (res.success) {
      setSyncMsg(`Synced ${res.syncedCount} queued bills to cloud database!`);
      onSyncTriggered();
    } else {
      setSyncMsg('Sync error: Please disable offline simulation first.');
    }
    setTimeout(() => setSyncMsg(''), 3500);
  };

  const pendingCount = getOfflineQueue().length;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-md bg-[#080808]/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2 text-[#00F2FF]">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-tight">App Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* SECTION 1: Biometric Authentication */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00F2FF]" />
                Biometric Security
              </span>
              <span className="text-[10px] font-mono text-[#00F2FF] bg-[#00F2FF15] px-2 py-0.5 rounded-full border border-[#00F2FF33]">
                FIDO2 / WebAuthn
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-md">
              {/* Toggle switch */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Require Biometrics on Launch</div>
                  <div className="text-[11px] text-white/50">
                    Use Fingerprint or Face ID to unlock bookkeeping
                  </div>
                </div>

                <button
                  id="toggle-biometrics-btn"
                  onClick={handleToggleBiometrics}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    biometrics.isEnabled ? 'bg-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.5)]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                      biometrics.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Test Biometric Button */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-white/50">Sensor verification test:</span>
                <button
                  id="btn-test-biometric"
                  onClick={handleTestBiometric}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] border border-white/10"
                >
                  Test Biometrics
                </button>
              </div>
              {bioTestMsg && (
                <p className="text-[11px] font-mono text-[#00F2FF]">{bioTestMsg}</p>
              )}

              {/* PIN Code Configuration */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Backup 4-Digit Passcode:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="input-change-pin"
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-16 bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 text-center text-white font-mono font-bold tracking-widest focus:outline-none focus:border-[#00F2FF]"
                    />
                    <button
                      id="btn-save-pin"
                      onClick={handleSavePin}
                      className="px-2.5 py-0.5 rounded-lg bg-[#CCFF00] text-black font-bold text-[11px] shadow-[0_0_10px_rgba(204,255,0,0.3)]"
                    >
                      Save
                    </button>
                  </div>
                </div>
                {pinSaved && (
                  <p className="text-[11px] text-[#CCFF00] font-mono">
                    Passcode updated successfully!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Offline Mode & Remote Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                Offline Mode & Cloud Sync
              </span>
              <span className="text-[10px] font-mono text-amber-400">IndexedDB Cache</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-md">
              {/* Simulate Offline toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Simulate Remote / Offline Access</div>
                  <div className="text-[11px] text-white/50">
                    Test full offline bill scanning and queueing without internet
                  </div>
                </div>

                <button
                  id="toggle-simulate-offline-btn"
                  onClick={handleToggleOfflineMode}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    offlineSimulated ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                      offlineSimulated ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Offline Queue Sync */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white/70 font-medium">Pending Queue:</span>
                  <span className="text-amber-400 font-mono ml-1.5 font-bold">
                    {pendingCount} bills queued
                  </span>
                </div>

                <button
                  id="btn-force-sync"
                  onClick={handleManualSync}
                  disabled={isSyncing || offlineSimulated}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#00F2FF22] text-white hover:text-[#00F2FF] disabled:opacity-40 flex items-center gap-1.5 font-semibold transition-colors border border-white/10"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync to Cloud</span>
                </button>
              </div>

              {syncMsg && (
                <p className="text-[11px] font-mono text-[#00F2FF] animate-pulse">{syncMsg}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: Storage & System Diagnostics */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-white/50" />
              Cloud Database & Storage
            </span>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-[11px] text-white/50 backdrop-blur-md">
              <span>Total Stored Records</span>
              <span className="text-white font-bold">{billsCount} bills</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
