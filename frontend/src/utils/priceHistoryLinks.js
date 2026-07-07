/**
 * Utility: priceHistoryLinks.js
 * Generates public price-history search URLs for products without scraping or using paid APIs.
 * Supports PriceHistory.app and PriceBefore with configurable fallback patterns.
 */

import { getAmazonProductUrl, getFlipkartProductUrl, getStoreProductUrl, extractProductId as getProdId } from './productUrls';
export { getAmazonProductUrl, getFlipkartProductUrl, getStoreProductUrl };

export const PRICE_HISTORY_PROVIDERS = {
  PRICE_HISTORY_APP: {
    name: 'PriceHistory.app',
    urlPattern: 'https://pricehistory.app/page/search#gsc.tab=0&gsc.q={{QUERY}}',
    fallbackPattern: 'https://www.pricebefore.com/search/?q={{QUERY}}',
  },
  PRICE_BEFORE: {
    name: 'PriceBefore',
    urlPattern: 'https://www.pricebefore.com/search/?q={{QUERY}}',
  },
  GOOGLE_SHOPPING: {
    name: 'Google Shopping',
    urlPattern: 'https://www.google.com/search?tbm=shop&q={{QUERY}}',
  },
  AMAZON_KEEPA: {
    name: 'Keepa (Amazon)',
    urlPattern: 'https://keepa.com/#!search/10-{{QUERY}}',
  }
};

// Current active default provider (configurable)
export const ACTIVE_PROVIDER = 'PRICE_HISTORY_APP';

/**
 * Clean product name to remove lengthy hardware specs, commas, and parentheses
 * which often cause 404s or "page not found" on price history search engines.
 */
export const cleanProductTitleForSearch = (productName) => {
  if (!productName) return '';
  
  // Extract main brand & model before commas or parentheses (e.g. "Lenovo IdeaPad Slim 5 (OLED), 16GB" -> "Lenovo IdeaPad Slim 5")
  let cleanName = productName.split(/[,(\-]/)[0].trim();
  
  // If splitting made it too short (< 5 chars), fall back to stripping special characters
  if (cleanName.length < 5 && productName.length >= 5) {
    cleanName = productName
      .replace(/\b(8GB|16GB|32GB|512GB|1TB|256GB|RAM|SSD|HDD|LPDDR4x|NVMe|M\.2|Ryzen|Intel|Core|i3|i5|i7|i9)\b/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  return cleanName || productName;
};

/**
 * Helper: Extract ASIN, SKU, or Product ID from product object or URL strings
 */
export const extractProductId = (product) => {
  return getProdId(product);
};

/**
 * 1. BUY NOW BUTTON & DIRECT PRODUCT LINK
 * Returns exact direct product URL returned by SerpAPI or ScrapingDog.
 * Prefers marketplace-specific product URLs (Flipkart, Amazon, Croma, Reliance Digital, etc.).
 * Never returns a search results page unless no exact product page exists.
 */
export const getDirectProductLink = (product) => {
  if (!product) return 'https://www.amazon.in';
  if (typeof product === 'string') return getStoreProductUrl(product, 'Amazon');
  const primaryStore = Array.isArray(product.stores) && product.stores[0] ? product.stores[0] : 'Amazon';
  return getStoreProductUrl(product, primaryStore);
};

/**
 * 2. VIEW PRICE HISTORY & DIRECT PRICE HISTORY LINK
 * Returns exact product price history page whenever possible.
 * Uses ASIN, Product ID, SKU, or unique identifiers.
 * If exact page cannot be determined, automatically searches for exact variant and redirects directly.
 */
export const getDirectPriceHistoryLink = (product, providerKey = ACTIVE_PROVIDER) => {
  if (!product) return 'https://pricehistory.app';
  if (typeof product === 'string') {
    return getPriceHistoryURL(product, providerKey);
  }

  // 1. Build exact variant query (Title + Brand + Model + Storage/RAM + Color)
  const title = product.title || product.name || '';
  const brand = product.brand ? `${product.brand} ` : '';
  const model = product.model || product.modelNumber ? `${product.model || product.modelNumber} ` : '';
  const specs = product.specifications || {};
  const ram = product.ram || specs.ram || specs.RAM ? `${product.ram || specs.ram || specs.RAM} ` : '';
  const storage = product.storage || specs.storage || specs.Storage ? `${product.storage || specs.storage || specs.Storage} ` : '';
  const color = product.color || specs.color ? `${product.color || specs.color} ` : '';

  // Combine and clean variant string
  let fullVariantQuery = `${brand}${model}${title} ${ram}${storage}${color}`.trim();
  const cleanVariant = cleanProductTitleForSearch(fullVariantQuery);
  const asin = extractProductId(product);

  // 2. Check for ASIN / Unique Product Identifier if Keepa is explicitly requested
  if (asin && providerKey === 'AMAZON_KEEPA') {
    return `https://keepa.com/#!product/10-${asin}`;
  }

  if (providerKey === 'PRICE_BEFORE') {
    const query = asin || cleanVariant || 'laptop';
    return `https://www.pricebefore.com/search/?q=${encodeURIComponent(query)}`;
  }
  
  // Default: direct search on PriceHistory.app
  const query = cleanVariant || asin || 'laptop';
  return `https://pricehistory.app/page/search#gsc.tab=0&gsc.q=${encodeURIComponent(query)}`;
};

/**
 * Generate Price History search URL for a given product name string
 * @param {string} productName - Name or title of the product
 * @param {string} providerKey - Key of the provider from PRICE_HISTORY_PROVIDERS
 * @returns {string} Fully formatted URL string
 */
export const getPriceHistoryURL = (productName, providerKey = ACTIVE_PROVIDER) => {
  if (!productName) return 'https://pricehistory.app';

  const cleanName = cleanProductTitleForSearch(productName);
  const provider = PRICE_HISTORY_PROVIDERS[providerKey] || PRICE_HISTORY_PROVIDERS.PRICE_HISTORY_APP;
  const encodedQuery = encodeURIComponent(cleanName);

  return provider.urlPattern.replace('{{QUERY}}', encodedQuery);
};

/**
 * Generate fallback PriceBefore URL
 * @param {string} productName - Name or title of the product
 * @returns {string} Fully formatted PriceBefore URL string
 */
export const getPriceBeforeURL = (productName) => {
  return getPriceHistoryURL(productName, 'PRICE_BEFORE');
};
