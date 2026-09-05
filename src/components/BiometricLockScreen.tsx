/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, Delete } from 'lucide-react';
import { triggerWebAuthnChallenge, setSessionUnlocked } from '../utils/biometrics';

interface BiometricLockScreenProps {
  onUnlockSuccess: () => void;
  pinCode?: string;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onUnlockSuccess,
  pinCode = '1234',
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric');
  const [pinInput, setPinInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Biometric Authenticator Scan
  const handleScanBiometrics = async () => {
    setIsScanning(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await triggerWebAuthnChallenge();
      if (result.success) {
        setSuccessMsg('Biometric Verified • Access Granted');
        setTimeout(() => {
          setSessionUnlocked(true);
          onUnlockSuccess();
        }, 600);
      } else {
        setErrorMsg(result.error || 'Biometrics not recognized. Please retry or enter PIN.');
      }
    } catch (err: any) {
      setErrorMsg('Authentication error. Use PIN to proceed.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle PIN Input
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        if (newPin === pinCode) {
          setSuccessMsg('PIN Verified • Access Granted');
          setTimeout(() => {
            setSessionUnlocked(true);
            onUnlockSuccess();
          }, 400);
        } else {
          setErrorMsg('Incorrect PIN. (Default PIN is 1234)');
          setTimeout(() => setPinInput(''), 700);
        }
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div
      id="biometric-lock-screen"
      className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-4 text-white"
    >
      <div
        id="biometric-prompt-card"
        className="w-full max-w-sm bg-[#080808]/90 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00F2FF]/20 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#CCFF00]/15 rounded-full blur-[40px] pointer-events-none" />

        {/* Top Header Banner */}
        <div className="flex items-center gap-2 mb-2 text-[#00F2FF]">
          <ShieldCheck className="w-6 h-6 text-[#00F2FF]" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold">
            Biometric Security
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          BillKeeper Locked
        </h2>
        <p className="text-xs text-white/50 mt-1 max-w-[260px]">
          Authenticate to access your bookkeeping records, receipts & cloud database.
        </p>

        {/* Feedback messages */}
        {errorMsg && (
          <div
            id="biometric-error-badge"
            className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-full animate-shake"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            id="biometric-success-badge"
            className="mt-3 flex items-center gap-1.5 text-xs text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(204,255,0,0.2)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Biometric Scan Mode */}
        {authMode === 'biometric' && (
          <div className="my-6 flex flex-col items-center w-full">
            {/* Interactive Animated Fingerprint Sensor */}
            <button
              id="btn-fingerprint-sensor"
              onClick={handleScanBiometrics}
              disabled={isScanning}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
                isScanning
                  ? 'bg-[#00F2FF]/20 border-2 border-[#00F2FF] scale-105 shadow-[0_0_35px_rgba(0,242,255,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#00F2FF]/50 hover:shadow-[0_0_25px_rgba(0,242,255,0.25)]'
              }`}
            >
              {/* Pulse waves */}
              {isScanning && (
                <>
                  <span className="absolute inset-0 rounded-full border border-[#00F2FF] animate-ping opacity-40"></span>
                  <span className="absolute -inset-2 rounded-full border border-[#CCFF00] animate-pulse opacity-30"></span>
                </>
              )}

              <Fingerprint
                className={`w-14 h-14 transition-colors ${
                  isScanning ? 'text-[#00F2FF] animate-pulse' : 'text-white/70 hover:text-[#00F2FF]'
                }`}
              />
            </button>

            <span className="mt-4 text-xs font-mono text-white/60">
              {isScanning ? 'Verifying with Android Biometrics...' : 'Touch sensor to scan Fingerprint or Face'}
            </span>

            <button
              id="btn-switch-pin"
              onClick={() => setAuthMode('pin')}
              className="mt-6 flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Use PIN Passcode Instead</span>
            </button>
          </div>
        )}

        {/* PIN Entry Mode */}
        {authMode === 'pin' && (
          <div className="my-4 flex flex-col items-center w-full">
            {/* PIN Dots Indicator */}
            <div className="flex items-center gap-3 my-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    pinInput.length > idx
                      ? 'bg-[#CCFF00] border-[#CCFF00] scale-110 shadow-[0_0_10px_#CCFF00]'
                      : 'border-white/30 bg-transparent'
                  }`}
                />
              ))}
            </div>

            <div className="text-[11px] text-white/50 mb-3 font-mono">
              Default system PIN: <span className="text-[#CCFF00] font-bold">1234</span>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[220px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  id={`pin-key-${num}`}
                  onClick={() => handlePinDigit(num)}
                  className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-[#CCFF00]/20 text-lg font-bold text-white transition-colors flex items-center justify-center border border-white/10"
                >
                  {num}
                </button>
              ))}
              <button
                id="btn-switch-biometric-back"
                onClick={() => setAuthMode('biometric')}
                className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#00F2FF] flex items-center justify-center border border-white/10 hover:border-[#00F2FF]/40"
              >
                <Fingerprint className="w-5 h-5" />
              </button>
              <button
                id="pin-key-0"
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-[#CCFF00]/20 text-lg font-bold text-white transition-colors flex items-center justify-center border border-white/10"
              >
                0
              </button>
              <button
                id="pin-key-backspace"
                onClick={handlePinBackspace}
                className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-rose-500/20 text-white/60 hover:text-rose-400 flex items-center justify-center border border-white/10"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-between text-[11px] text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] shadow-[0_0_6px_#00F2FF]"></span>
            FIDO2 / WebAuthn
          </span>
          <span className="font-mono">AES-256 local lock</span>
        </div>
      </div>
    </div>
  );
};
