/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleReceipt {
  id: string;
  name: string;
  category: string;
  merchant: string;
  amount: number;
  date: string;
  imageUrl: string;
  description: string;
  mockOCR: {
    merchant: string;
    date: string;
    totalAmount: number;
    currency: string;
    taxAmount: number;
    category: any;
    paymentMethod: string;
    confidenceScore: number;
    lineItems: Array<{ description: string; quantity?: number; unitPrice?: number; total: number }>;
    notes: string;
    rawText: string;
  };
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: "sample-groceries",
    name: "Trader Joe's Groceries",
    category: "Groceries",
    merchant: "Trader Joe's #142",
    amount: 62.45,
    date: new Date().toISOString().split("T")[0],
    description: "Organic produce, sourdough bread, oat milk & pantry items",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    mockOCR: {
      merchant: "Trader Joe's #142",
      date: new Date().toISOString().split("T")[0],
      totalAmount: 62.45,
      currency: "$",
      taxAmount: 4.15,
      category: "Groceries",
      paymentMethod: "Apple Pay ****9021",
      confidenceScore: 98,
      lineItems: [
        { description: "Organic Baby Spinach 16oz", quantity: 1, unitPrice: 3.99, total: 3.99 },
        { description: "Almond Milk Unsweetened 64oz", quantity: 2, unitPrice: 3.49, total: 6.98 },
        { description: "Pasture Raised Organic Eggs 1-doz", quantity: 1, unitPrice: 5.49, total: 5.49 },
        { description: "Wild Atlantic Smoked Salmon 8oz", quantity: 1, unitPrice: 12.99, total: 12.99 },
        { description: "Everything But The Bagel Seasoning", quantity: 2, unitPrice: 2.99, total: 5.98 },
        { description: "Honeycrisp Apples bag", quantity: 1, unitPrice: 6.99, total: 6.99 },
        { description: "Organic Dark Chocolate 72%", quantity: 3, unitPrice: 2.99, total: 8.97 },
        { description: "Sourdough Boule Artisan Loaf", quantity: 1, unitPrice: 4.90, total: 4.90 },
      ],
      notes: "Weekly family grocery haul receipt #TJ-9102",
      rawText: "TRADER JOE'S #142\nSTORE 0142 REG 03\nSUBTOTAL $58.30\nSALES TAX $4.15\nTOTAL $62.45\nCARD TENDER APPLE PAY $62.45\nTHANK YOU FOR SHOPPING WITH US",
    },
  },
  {
    id: "sample-dining",
    name: "Blue Bottle Coffee & Breakfast",
    category: "Dining & Food",
    merchant: "Blue Bottle Coffee",
    amount: 24.80,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "Espresso, oat milk cappuccino & avocado toast",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
    mockOCR: {
      merchant: "Blue Bottle Coffee - Market St",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: 24.80,
      currency: "$",
      taxAmount: 2.30,
      category: "Dining & Food",
      paymentMethod: "Contactless Visa ****3110",
      confidenceScore: 97,
      lineItems: [
        { description: "Hayes Valley Espresso Double", quantity: 1, unitPrice: 5.25, total: 5.25 },
        { description: "Oat Milk Vanilla Latte 12oz", quantity: 1, unitPrice: 7.25, total: 7.25 },
        { description: "Avocado & Microgreen Toast", quantity: 1, unitPrice: 10.00, total: 10.00 },
      ],
      notes: "Morning client coffee catchup",
      rawText: "BLUE BOTTLE COFFEE\nORDER #481 - TAKE OUT\nTOTAL: $24.80\nTAX INCL: $2.30\nAPPROVED",
    },
  },
  {
    id: "sample-utilities",
    name: "Fiber Internet & Cloud Bill",
    category: "Utilities & Bills",
    merchant: "Sonic Gigabit Fiber",
    amount: 85.00,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "Monthly 10Gbps residential fiber internet service invoice",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    mockOCR: {
      merchant: "Sonic Telecom Internet",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: 85.00,
      currency: "$",
      taxAmount: 5.00,
      category: "Utilities & Bills",
      paymentMethod: "Direct Bank Auto-Debit",
      confidenceScore: 99,
      lineItems: [
        { description: "Gigabit Fiber Internet 1000Mbps", quantity: 1, unitPrice: 65.00, total: 65.00 },
        { description: "Wi-Fi 6E Mesh Hardware Rental", quantity: 1, unitPrice: 15.00, total: 15.00 },
        { description: "Regulatory Surcharge & Franchise Fee", quantity: 1, unitPrice: 5.00, total: 5.00 },
      ],
      notes: "Monthly ISP invoice #SONIC-2026-09",
      rawText: "SONIC TELECOM SERVICES\nACCOUNT: 409184-1\nTOTAL DUE: $85.00\nPAID VIA AUTOPAY ON DUE DATE",
    },
  },
  {
    id: "sample-electronics",
    name: "Apple Store Tech Accessories",
    category: "Office & Business",
    merchant: "Apple Store Union Square",
    amount: 149.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "Magic Keyboard with Touch ID & USB-C Cable",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
    mockOCR: {
      merchant: "Apple Store #R074",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: 149.00,
      currency: "$",
      taxAmount: 12.65,
      category: "Office & Business",
      paymentMethod: "Apple Card ****7712",
      confidenceScore: 99,
      lineItems: [
        { description: "Magic Keyboard with Touch ID (White)", quantity: 1, unitPrice: 149.00, total: 149.00 },
      ],
      notes: "Invoice #APL-94012 - Hardware tax deductible",
      rawText: "APPLE STORE UNION SQUARE\nTAX INVOICE #APL-94012\nTOTAL: $149.00\nTAX: $12.65",
    },
  },
];
