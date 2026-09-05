/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BillCategory =
  | 'Groceries'
  | 'Dining & Food'
  | 'Utilities & Bills'
  | 'Shopping'
  | 'Travel & Transport'
  | 'Healthcare'
  | 'Entertainment'
  | 'Office & Business'
  | 'Others';

export interface LineItem {
  id?: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
}

export interface BillItem {
  id: string;
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  taxAmount?: number;
  category: BillCategory;
  paymentMethod?: string;
  confidenceScore?: number;
  lineItems: LineItem[];
  notes?: string;
  rawText?: string;
  imageUrl?: string;
  status: 'synced' | 'pending_sync' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface OCRResult {
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  taxAmount?: number;
  category: BillCategory;
  paymentMethod?: string;
  confidenceScore?: number;
  lineItems: LineItem[];
  notes?: string;
  rawText?: string;
  warning?: string;
}

export interface MonthlySpendingSummary {
  monthKey: string; // "2026-09"
  monthName: string; // "September 2026"
  totalSpending: number;
  transactionCount: number;
  categoryTotals: Record<BillCategory, number>;
  dailyTrend: { day: number; amount: number; count: number }[];
  previousMonthTotal: number;
  percentChange: number;
}

export interface BiometricStatus {
  isSupported: boolean;
  isEnabled: boolean;
  isLocked: boolean;
  authMethod: 'biometric' | 'pin';
  pinCode: string; // Defaults to "1234"
  registeredAt?: string;
}

export interface SyncState {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}
