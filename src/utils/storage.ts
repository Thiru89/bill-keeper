/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BillItem } from '../types';

const STORAGE_KEYS = {
  BILLS_CACHE: 'billkeeper_cached_bills',
  OFFLINE_QUEUE: 'billkeeper_offline_queue',
  SIMULATED_OFFLINE: 'billkeeper_simulated_offline',
  LAST_SYNC: 'billkeeper_last_synced_at',
  BIOMETRIC_CONFIG: 'billkeeper_biometric_config',
};

// Check if user or browser is currently offline
export function isNetworkOffline(): boolean {
  if (typeof window === 'undefined') return false;
  const isSimulated = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  return isSimulated || !navigator.onLine;
}

export function setSimulatedOffline(val: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, val ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('billkeeper_network_change', { detail: { offline: val } }));
}

export function getSimulatedOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
}

// Local cache methods
export function getLocalBills(): BillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILLS_CACHE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local bills cache:', e);
    return [];
  }
}

export function setLocalBills(bills: BillItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BILLS_CACHE, JSON.stringify(bills));
  } catch (e) {
    console.error('Error saving bills to local cache:', e);
  }
}

// Offline queue methods
export function getOfflineQueue(): BillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

export function addToOfflineQueue(bill: BillItem) {
  try {
    const queue = getOfflineQueue();
    const existingIdx = queue.findIndex((q) => q.id === bill.id);
    if (existingIdx >= 0) {
      queue[existingIdx] = bill;
    } else {
      queue.push(bill);
    }
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving to offline queue:', e);
  }
}

export function clearOfflineQueue() {
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
}

// Fetch all bills with offline-first fallback
export async function fetchBillsWithFallback(params?: {
  q?: string;
  category?: string;
  month?: string;
}): Promise<{ bills: BillItem[]; isFromCache: boolean }> {
  const isOffline = isNetworkOffline();

  if (isOffline) {
    // Read from local cache and apply client-side filtering
    let localBills = getLocalBills();
    if (params?.q && params.q.trim()) {
      const query = params.q.toLowerCase().trim();
      localBills = localBills.filter(
        (b) =>
          b.merchant.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query) ||
          b.lineItems?.some((i) => i.description.toLowerCase().includes(query)) ||
          b.totalAmount.toString().includes(query)
      );
    }
    if (params?.category && params.category !== 'All') {
      localBills = localBills.filter((b) => b.category === params.category);
    }
    if (params?.month && params.month !== 'All') {
      localBills = localBills.filter((b) => b.date.startsWith(params.month!));
    }
    return { bills: localBills, isFromCache: true };
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.set('q', params.q);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.month) queryParams.set('month', params.month);

    const res = await fetch(`/api/bills?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const cloudBills: BillItem[] = data.bills || [];

    // Update local cache with latest cloud data
    setLocalBills(cloudBills);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    return { bills: cloudBills, isFromCache: false };
  } catch (err) {
    console.warn('Network request failed, falling back to local cache:', err);
    return { bills: getLocalBills(), isFromCache: true };
  }
}

// Save a bill: If offline, saves to local cache and offline queue. If online, posts to cloud DB.
export async function saveBillRecord(bill: BillItem): Promise<{ bill: BillItem; isQueuedOffline: boolean }> {
  const isOffline = isNetworkOffline();

  if (isOffline) {
    const offlineBill: BillItem = {
      ...bill,
      status: 'pending_sync',
      updatedAt: new Date().toISOString(),
    };

    // Update local bills list
    const currentBills = getLocalBills();
    const existingIndex = currentBills.findIndex((b) => b.id === offlineBill.id);
    if (existingIndex >= 0) {
      currentBills[existingIndex] = offlineBill;
    } else {
      currentBills.unshift(offlineBill);
    }
    setLocalBills(currentBills);

    // Add to offline sync queue
    addToOfflineQueue(offlineBill);

    return { bill: offlineBill, isQueuedOffline: true };
  }

  // If online, save to cloud DB
  try {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });

    if (!res.ok) throw new Error(`Failed to save bill to cloud (${res.status})`);
    const data = await res.json();
    const savedBill: BillItem = data.bill;

    // Update local cache
    const currentBills = getLocalBills();
    const existingIndex = currentBills.findIndex((b) => b.id === savedBill.id);
    if (existingIndex >= 0) {
      currentBills[existingIndex] = savedBill;
    } else {
      currentBills.unshift(savedBill);
    }
    setLocalBills(currentBills);

    return { bill: savedBill, isQueuedOffline: false };
  } catch (err) {
    console.warn('Could not post to cloud, storing in offline queue:', err);
    const offlineBill: BillItem = {
      ...bill,
      status: 'pending_sync',
      updatedAt: new Date().toISOString(),
    };
    addToOfflineQueue(offlineBill);
    return { bill: offlineBill, isQueuedOffline: true };
  }
}

// Delete a bill
export async function deleteBillRecord(id: string): Promise<boolean> {
  // Update local cache
  const localBills = getLocalBills().filter((b) => b.id !== id);
  setLocalBills(localBills);

  if (isNetworkOffline()) {
    // If pending in queue, remove it from queue too
    const queue = getOfflineQueue().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return true;
  }

  try {
    const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Error deleting bill:', err);
    return true;
  }
}

// Synchronize offline queue with cloud database
export async function syncOfflineQueue(): Promise<{ syncedCount: number; success: boolean }> {
  if (isNetworkOffline()) {
    return { syncedCount: 0, success: false };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, success: true };
  }

  try {
    const res = await fetch('/api/bills/batch-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: queue }),
    });

    if (!res.ok) throw new Error('Sync batch request failed');
    const data = await res.json();

    // Clear queue after successful batch push
    clearOfflineQueue();
    if (data.bills) {
      setLocalBills(data.bills);
    }
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    return { syncedCount: data.syncedCount || queue.length, success: true };
  } catch (err) {
    console.error('Batch sync failed:', err);
    return { syncedCount: 0, success: false };
  }
}
