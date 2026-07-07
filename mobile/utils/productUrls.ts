/**
 * productUrls.ts — Mobile port of frontend/src/utils/productUrls.js
 * Generates store URLs and redirect links for product cards.
 */

import { Platform } from 'react-native';
import { BASE_URL } from './api';

const BACKEND = BASE_URL.replace('/api', '');

export const extractProductId = (product: any): string | null => {
  if (!product) return null;
  if (typeof product === 'string') {
    const asinMatch = product.match(/\/dp\/([A-Z0-9]{10})/);
    if (asinMatch) return asinMatch[1];
    const b0match = product.match(/\b(B0[A-Z0-9]{8})\b/);
    if (b0match) return b0match[1];
    return null;
  }
  if (product.asin) return product.asin;
  if (product.productUrl) {
    if (product.productUrl.includes('amazon.')) {
      const m = product.productUrl.match(/\/dp\/([A-Z0-9]{10})/);
      if (m) return m[1];
    }
  }
  const urlFields = ['productUrl', 'link', 'url'];
  for (const f of urlFields) {
    const v = product[f];
    if (v && typeof v === 'string' && v.includes('amazon.')) {
      const m = v.match(/\/dp\/([A-Z0-9]{10})/);
      if (m) return m[1];
    }
  }
  return null;
};

export const getAmazonProductUrl = (product: any): string => {
  const asin = extractProductId(product);
  if (asin) return `https://www.amazon.in/dp/${asin}`;
  const title = typeof product === 'string' ? product : (product?.title || product?.name || 'laptop');
  return `${BACKEND}/api/products/redirect?store=Amazon+India&title=${encodeURIComponent(title)}`;
};

export const getFlipkartProductUrl = (product: any): string => {
  const title = (typeof product === 'string' ? product : (product?.title || product?.name || 'laptop')).toLowerCase();
  const cleanTitle = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${BACKEND}/api/products/redirect?store=Flipkart&title=${encodeURIComponent(cleanTitle)}`;
};

export const getStoreProductUrl = (product: any, store: any): string => {
  if (!product && !store) return 'https://www.amazon.in';

  // If store object has a direct verified link
  if (store && typeof store === 'object' && store.link && typeof store.link === 'string') {
    const l = store.link;
    if (l.startsWith('http') && !l.includes('/redirect') && !l.includes('localhost')) {
      return l;
    }
  }

  // If product has a direct productUrl
  if (product && product.productUrl && typeof product.productUrl === 'string') {
    const pu = product.productUrl;
    if (pu.startsWith('http') && !pu.includes('/redirect') && !pu.includes('localhost')) {
      return pu;
    }
  }

  const storeName = typeof store === 'string' ? store : (store?.name || store?.store || 'Amazon India');
  const title = typeof product === 'string' ? product : (product?.title || product?.name || 'product');
  const cleanTitle = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const lowerStore = storeName.toLowerCase();

  if (lowerStore.includes('amazon')) return getAmazonProductUrl(product);
  if (lowerStore.includes('flipkart')) return getFlipkartProductUrl(product);

  return `${BACKEND}/api/products/redirect?store=${encodeURIComponent(storeName)}&title=${encodeURIComponent(cleanTitle)}`;
};
