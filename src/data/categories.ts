/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BillCategory } from '../types';

export interface CategoryMeta {
  id: BillCategory;
  name: string;
  color: string; // High-contrast hex
  bgColor: string; // High-contrast subtle bg
  borderColor: string;
  iconName: string;
}

export const CATEGORIES: Record<BillCategory, CategoryMeta> = {
  Groceries: {
    id: 'Groceries',
    name: 'Groceries',
    color: '#CCFF00', // Volt Lime
    bgColor: 'rgba(204, 255, 0, 0.12)',
    borderColor: 'rgba(204, 255, 0, 0.4)',
    iconName: 'ShoppingBag',
  },
  'Dining & Food': {
    id: 'Dining & Food',
    name: 'Dining & Food',
    color: '#FF9900', // Vibrant amber
    bgColor: 'rgba(255, 153, 0, 0.12)',
    borderColor: 'rgba(255, 153, 0, 0.4)',
    iconName: 'Utensils',
  },
  'Utilities & Bills': {
    id: 'Utilities & Bills',
    name: 'Utilities & Bills',
    color: '#00F2FF', // Electric Cyan
    bgColor: 'rgba(0, 242, 255, 0.12)',
    borderColor: 'rgba(0, 242, 255, 0.4)',
    iconName: 'Zap',
  },
  Shopping: {
    id: 'Shopping',
    name: 'Shopping',
    color: '#E056FD', // Magenta neon
    bgColor: 'rgba(224, 86, 253, 0.12)',
    borderColor: 'rgba(224, 86, 253, 0.4)',
    iconName: 'Tag',
  },
  'Travel & Transport': {
    id: 'Travel & Transport',
    name: 'Travel & Transport',
    color: '#FFD600', // Yellow
    bgColor: 'rgba(255, 214, 0, 0.12)',
    borderColor: 'rgba(255, 214, 0, 0.4)',
    iconName: 'Navigation',
  },
  Healthcare: {
    id: 'Healthcare',
    name: 'Healthcare',
    color: '#FF4D6D', // Coral neon
    bgColor: 'rgba(255, 77, 109, 0.12)',
    borderColor: 'rgba(255, 77, 109, 0.4)',
    iconName: 'HeartPulse',
  },
  Entertainment: {
    id: 'Entertainment',
    name: 'Entertainment',
    color: '#9D4EDD', // Violet
    bgColor: 'rgba(157, 78, 221, 0.12)',
    borderColor: 'rgba(157, 78, 221, 0.4)',
    iconName: 'Film',
  },
  'Office & Business': {
    id: 'Office & Business',
    name: 'Office & Business',
    color: '#00D8F6', // Cyan blue
    bgColor: 'rgba(0, 216, 246, 0.12)',
    borderColor: 'rgba(0, 216, 246, 0.4)',
    iconName: 'Briefcase',
  },
  Others: {
    id: 'Others',
    name: 'Others',
    color: '#A0AEC0', // Subtle slate
    bgColor: 'rgba(160, 174, 192, 0.12)',
    borderColor: 'rgba(160, 174, 192, 0.4)',
    iconName: 'Layers',
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORIES) as BillCategory[];
