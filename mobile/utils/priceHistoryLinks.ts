/**
 * priceHistoryLinks.ts — Mobile port of frontend/src/utils/priceHistoryLinks.js
 */

const cleanProductTitleForSearch = (name: string): string => {
  if (!name) return '';
  let clean = name.split(/[,(\-]/)[0].trim();
  if (clean.length < 5 && name.length >= 5) {
    clean = name
      .replace(/\b(8GB|16GB|32GB|512GB|1TB|256GB|RAM|SSD|HDD|LPDDR4x|NVMe|M\.2|Ryzen|Intel|Core|i3|i5|i7|i9)\b/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return clean || name;
};

export const getPriceHistoryUrl = (product: any): string => {
  if (!product) return 'https://pricehistory.app';
  const title = typeof product === 'string' ? product : (product?.title || product?.name || '');
  const brand = product?.brand ? `${product.brand} ` : '';
  const specs = product?.specifications || {};
  const ram = product?.ram || specs?.ram || specs?.RAM ? `${product?.ram || specs?.ram || specs?.RAM} ` : '';
  const storage = product?.storage || specs?.storage || specs?.Storage
    ? `${product?.storage || specs?.storage || specs?.Storage} `
    : '';

  const fullQuery = `${brand}${title} ${ram}${storage}`.trim();
  const clean = cleanProductTitleForSearch(fullQuery);
  const query = clean || 'laptop';
  return `https://pricehistory.app/page/search#gsc.tab=0&gsc.q=${encodeURIComponent(query)}`;
};

export const getPriceBeforeUrl = (product: any): string => {
  const title = typeof product === 'string' ? product : (product?.title || product?.name || '');
  const clean = cleanProductTitleForSearch(title);
  return `https://www.pricebefore.com/search/?q=${encodeURIComponent(clean || 'laptop')}`;
};
