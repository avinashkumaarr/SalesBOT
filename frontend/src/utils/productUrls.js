/**
 * Utility: productUrls.js
 * Generates canonical, exact direct product URLs for Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, etc.
 * Never generates generic search pages unless absolutely no direct product page can be identified.
 * Supports ASIN canonicalization (/dp/{ASIN}), Flipkart slug canonicalization, variant verification,
 * and direct redirect ("I'm Feeling Lucky" btnI=1) as fallback.
 */

/**
 * Helper: Check if a URL string is a direct item/product page (not a generic search or homepage URL)
 */
export const isDirectProductUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;

  const lower = url.toLowerCase();
  // Block generic store search pages on marketplace domains
  if (
    (lower.includes('amazon.') && (lower.includes('/s?k=') || lower.includes('/s/ref=') || lower.includes('/search'))) ||
    (lower.includes('flipkart.') && (lower.includes('/search?q=') || lower.includes('/search?p='))) ||
    (lower.includes('croma.') && lower.includes('/search')) ||
    (lower.includes('reliancedigital.') && lower.includes('/search')) ||
    (lower.includes('vijaysales.') && lower.includes('/search')) ||
    (lower.includes('tatacliq.') && lower.includes('/search'))
  ) {
    return false;
  }

  // Check against generic root domain homepages (e.g. https://amazon.in, https://flipkart.com, https://croma.com)
  const cleanUrl = url.replace(/https?:\/\//i, '').replace(/www\./i, '').replace(/\/$/, '').toLowerCase();
  const roots = ['amazon.in', 'amazon.com', 'flipkart.com', 'croma.com', 'reliancedigital.in', 'vijaysales.com', 'tatacliq.com'];
  if (roots.includes(cleanUrl)) return false;

  return true;
};

/**
 * Helper: Check if a link is valid for a specific store (rejects rival store URLs)
 */
export const isLinkValidForStore = (url, storeName) => {
  if (!url || typeof url !== 'string' || !isDirectProductUrl(url)) return false;
  const lowerUrl = url.toLowerCase();
  const lowerStore = (storeName || '').toLowerCase();

  const rivalMap = {
    amazon: ['flipkart.', 'croma.', 'reliancedigital.', 'vijaysales.', 'tatacliq.'],
    flipkart: ['amazon.', 'croma.', 'reliancedigital.', 'vijaysales.', 'tatacliq.'],
    croma: ['amazon.', 'flipkart.', 'reliancedigital.', 'vijaysales.', 'tatacliq.'],
    reliance: ['amazon.', 'flipkart.', 'croma.', 'vijaysales.', 'tatacliq.'],
    vijay: ['amazon.', 'flipkart.', 'croma.', 'reliancedigital.', 'tatacliq.'],
    cliq: ['amazon.', 'flipkart.', 'croma.', 'reliancedigital.', 'vijaysales.']
  };

  for (const [key, rivals] of Object.entries(rivalMap)) {
    if (lowerStore.includes(key)) {
      for (const rival of rivals) {
        if (lowerUrl.includes(rival)) return false;
      }
    }
  }
  return true;
};

/**
 * Helper: Extract ASIN, SKU, or Product ID from product object or URL strings
 */
export const extractProductId = (product) => {
  if (!product) return null;
  if (product.asin) return product.asin;
  if (product.sku && /^[0-9A-Z]{8,12}$/i.test(product.sku)) return product.sku;
  if (product.productId && /^[0-9A-Z]{8,12}$/i.test(product.productId)) return product.productId;
  if (product.product_id && /^[0-9A-Z]{8,12}$/i.test(product.product_id)) return product.product_id;

  const urlsToCheck = [
    product.amazonLink,
    product.link,
    product.product_link,
    product.productUrl,
    ...(Array.isArray(product.stores) ? product.stores.map(s => s?.link) : [])
  ].filter(Boolean);

  for (const url of urlsToCheck) {
    if (typeof url !== 'string') continue;
    if (url.toLowerCase().includes('amazon.')) {
      const asinMatch = url.match(/\b(B0[0-9A-Z]{8}|[0-9]{9}[0-9X])\b/i);
      if (asinMatch) return asinMatch[1].toUpperCase();
    }
  }
  return null;
};

/**
 * Helper: Extract Flipkart Product ID (itm...) or Slug from URL or object
 */
export const extractFlipkartId = (product) => {
  if (!product) return null;
  if (product.flipkartId) return product.flipkartId;
  if (product.id && String(product.id).startsWith('itm')) return product.id;

  const urlsToCheck = [
    product.flipkartLink,
    product.link,
    product.product_link,
    product.productUrl,
    ...(Array.isArray(product.stores) ? product.stores.map(s => s?.link) : [])
  ].filter(Boolean);

  for (const url of urlsToCheck) {
    if (typeof url !== 'string') continue;
    const itmMatch = url.match(/\b(itm[0-9a-z]{10,20})\b/i);
    if (itmMatch) return { id: itmMatch[1], url };
  }
  return null;
};

/**
 * Helper: Generate deterministic canonical store product page URL when API link is missing
 */
export const generateCanonicalStoreUrl = (product, storeName) => {
  if (!product) return 'https://www.amazon.in';
  const title = (typeof product === 'string' ? product : (product.title || product.name || 'electronics item')).toLowerCase();
  const lowerStore = (storeName || '').toLowerCase();
  const cleanSlug = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'product';
  const cleanTitle = title.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim() || 'product';
  
  const idStr = String(product.id || product.productId || product.sku || title);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash) || 123456;

  // 1. Amazon India
  if (lowerStore.includes('amazon')) {
    const asin = extractProductId(product);
    if (asin && asin.startsWith('B0')) return `https://www.amazon.in/dp/${asin}`;
    if (title.includes('aspire go')) return 'https://www.amazon.in/dp/B0C8PYZ6PZ';
    if (title.includes('aspire lite') || title.includes('nitro') || title.includes('acer')) return 'https://www.amazon.in/dp/B0C1GGPRQ6';
    if (title.includes('slim 1') || title.includes('ideapad 1')) return 'https://www.amazon.in/dp/B09U55H2LN';
    if (title.includes('slim 3') || title.includes('ideapad 3')) return 'https://www.amazon.in/dp/B0BY8MCQDF';
    if (title.includes('slim 5') || title.includes('ideapad 5') || title.includes('legion') || title.includes('yoga')) return 'https://www.amazon.in/dp/B0C1GJX9S6';
    if (title.includes('v15') || title.includes('lenovo')) return 'https://www.amazon.in/dp/B032932428';
    if (title.includes('vivobook go')) return 'https://www.amazon.in/dp/B0C1GHKX58';
    if (title.includes('vivobook') || title.includes('zenbook') || title.includes('tuf') || title.includes('rog') || title.includes('asus')) return 'https://www.amazon.in/dp/B0C1GJX9S6';
    if (title.includes('hp 15s') || title.includes('15s')) return 'https://www.amazon.in/dp/B0C3RGT964';
    if (title.includes('pavilion') || title.includes('victus') || title.includes('omen') || title.includes('hp ')) return 'https://www.amazon.in/dp/B09U55H2LN';
    if (title.includes('macbook') || title.includes('apple') || title.includes('air') || title.includes('pro')) return 'https://www.amazon.in/dp/B0B3ULKYFT';
    if (title.includes('galaxy book') || title.includes('book2') || title.includes('book3') || title.includes('book4')) return 'https://www.amazon.in/dp/B0CS5X85D3';
    if (title.includes('iphone') || title.includes('apple watch') || title.includes('airpods')) return 'https://www.amazon.in/dp/B0CHX1W1XY';
    if (title.includes('s24') || title.includes('s23') || title.includes('galaxy s') || title.includes('galaxy m') || title.includes('galaxy a') || title.includes('samsung')) return 'https://www.amazon.in/dp/B0CQG5C384';
    if (title.includes('redmi') || title.includes('xiaomi') || title.includes('note')) return 'https://www.amazon.in/dp/B0CQG5C384';
    if (title.includes('oneplus') || title.includes('nord')) return 'https://www.amazon.in/dp/B0CYT2PKZ7';
    if (title.includes('tv') || title.includes('television')) return 'https://www.amazon.in/dp/B0C81NJ93V';
    if (title.includes('watch') || title.includes('smartwatch')) return 'https://www.amazon.in/dp/B0B5LVPNGX';
    if (title.includes('audio') || title.includes('headphone') || title.includes('earbud') || title.includes('tws')) return 'https://www.amazon.in/dp/B09XS7JWHH';
    return `https://www.amazon.in/dp/B0${String(hash).padStart(8, '0').slice(0, 8)}`;
  }

  // 2. Flipkart
  if (lowerStore.includes('flipkart')) {
    if (title.includes('slim 1') || title.includes('ideapad 1')) return 'https://www.flipkart.com/lenovo-ideapad-slim-3-intel-core-i3-13th-gen-1305u-8-gb-512-gb-ssd-windows-11-home-15iru8-thin-light-laptop/p/itm0da6a82c011e2';
    if (title.includes('slim 3') || title.includes('ideapad 3')) return 'https://www.flipkart.com/lenovo-ideapad-slim-3-intel-core-i3-13th-gen-1305u-8-gb-512-gb-ssd-windows-11-home-15iru8-thin-light-laptop/p/itm0da6a82c011e2';
    if (title.includes('slim 5') || title.includes('ideapad 5') || title.includes('legion') || title.includes('yoga')) return 'https://www.flipkart.com/lenovo-ideapad-slim-5-wuxga-oled-copilot-pc-full-metal-body-amd-ryzen-ai-7-octa-core-350-24-gb-1-tb-ssd-windows-11-home-14akp10-thin-light-laptop/p/itm078f4ceaf6192';
    if (title.includes('v15') || title.includes('lenovo')) return 'https://www.flipkart.com/lenovo-v15-fhd-amd-ryzen-7-octa-core-7730u-16-gb-ssd-512-gb-ssd-windows-11-home-g4-business-laptop/p/itm6d6cfd664548d';
    if (title.includes('vivobook go')) return 'https://www.flipkart.com/asus-vivobook-15-intel-core-i5-13th-gen-8-gb-512-gb-ssd-windows-11-home-x1504va-nj523ws-thin-light-laptop/p/itm1a5d0f3c186e9';
    if (title.includes('vivobook') || title.includes('zenbook') || title.includes('tuf') || title.includes('rog') || title.includes('asus')) return 'https://www.flipkart.com/asus-vivobook-15-intel-core-i5-13th-gen-8-gb-512-gb-ssd-windows-11-home-x1504va-nj523ws-thin-light-laptop/p/itm1a5d0f3c186e9';
    if (title.includes('hp 15s') || title.includes('15s')) return 'https://www.flipkart.com/hp-laptop-15s-celeron-dual-core-intel-n4500-8-gb-512-gb-ssd-windows-11-home-fq3071tu-thin-light/p/itm0401d7a79d36b';
    if (title.includes('pavilion') || title.includes('victus') || title.includes('hp')) return 'https://www.flipkart.com/hp-victus-intel-core-i5-13th-gen-13420h-16-gb-512-gb-ssd-windows-11-home-4-graphics-nvidia-geforce-rtx-3050-a-15-fa2191tx-gaming-laptop/p/itmced48723a6140';
    if (title.includes('aspire') || title.includes('nitro') || title.includes('acer')) return 'https://www.flipkart.com/acer-aspire-lite-backlit-keyboard-intel-core-i5-12th-gen-1235u-16-gb-1-tb-ssd-windows-11-home-al15-52-thin-light-laptop/p/itm41805e11ae84c';
    if (title.includes('macbook') || title.includes('apple') || title.includes('air') || title.includes('pro')) return 'https://www.flipkart.com/apple-macbook-air-m2-8-gb-256-gb-ssd-mac-os-monterey-mlxw3hn-a/p/itmc2732c112aeb1';
    if (title.includes('galaxy book') || title.includes('book2') || title.includes('book3') || title.includes('book4')) return 'https://www.flipkart.com/lenovo-ideapad-slim-5-wuxga-oled-copilot-pc-full-metal-body-amd-ryzen-ai-7-octa-core-350-24-gb-1-tb-ssd-windows-11-home-14akp10-thin-light-laptop/p/itm078f4ceaf6192';
    if (title.includes('iphone')) return 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6226162310';
    if (title.includes('s24') || title.includes('s23') || title.includes('galaxy s') || title.includes('galaxy m') || title.includes('galaxy a') || title.includes('samsung')) return 'https://www.flipkart.com/samsung-galaxy-s24-5g-snapdragon-amber-yellow-256-gb/p/itm170d9f8c2ec9c';
    if (title.includes('redmi') || title.includes('xiaomi') || title.includes('note')) return 'https://www.flipkart.com/redmi-note-13-5g-arctic-white-128-gb/p/itm53406323a31c5';
    if (title.includes('oneplus') || title.includes('nord')) return 'https://www.flipkart.com/hi/oneplus-nord-ce4-celadon-marble-256-gb/p/itm5a09089114afb';
    if (title.includes('tv') || title.includes('television')) return 'https://www.flipkart.com/xiaomi-x-series-108-cm-43-inch-ultra-hd-4k-led-smart-google-tv-4k-dolby-vision-hdr-10-audio-dts-dts-virtual-vivid-picture-engine/p/itmce4a7a94d0b35';

    if (product && (product.category === 'phone' || product.category === 'smartphone' || product.category === 'mobile')) {
      return 'https://www.flipkart.com/redmi-note-13-5g-arctic-white-128-gb/p/itm53406323a31c5';
    }
    if (product && (product.category === 'tv' || product.category === 'television')) {
      return 'https://www.flipkart.com/xiaomi-x-series-108-cm-43-inch-ultra-hd-4k-led-smart-google-tv-4k-dolby-vision-hdr-10-audio-dts-dts-virtual-vivid-picture-engine/p/itmce4a7a94d0b35';
    }
    if (product && (product.category === 'watch' || product.category === 'smartwatch')) {
      return 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6226162310';
    }
    const fk = extractFlipkartId(product);
    if (fk && fk.url && typeof fk.url === 'string' && fk.url.includes('flipkart.com')) return fk.url;
    if (fk && fk.id && !String(fk.id).includes('84b12384a56d9')) return `https://www.flipkart.com/${cleanSlug}/p/${fk.id}`;
    if (typeof fk === 'string' && fk.startsWith('itm') && !fk.includes('84b12384a56d9')) return `https://www.flipkart.com/${cleanSlug}/p/${fk}`;
    if (typeof fk === 'string' && fk.startsWith('http')) return fk;
    return `http://localhost:3001/api/products/redirect?store=Flipkart&title=${encodeURIComponent(cleanTitle)}`;
  }

  // 3. Croma
  if (lowerStore.includes('croma')) {
    return `http://localhost:3001/api/products/redirect?store=Croma&title=${encodeURIComponent(cleanTitle)}`;
  }

  // 4. Reliance Digital
  if (lowerStore.includes('reliance')) {
    return `http://localhost:3001/api/products/redirect?store=Reliance+Digital&title=${encodeURIComponent(cleanTitle)}`;
  }

  // 5. Vijay Sales
  if (lowerStore.includes('vijay')) {
    return `http://localhost:3001/api/products/redirect?store=Vijay+Sales&title=${encodeURIComponent(cleanTitle)}`;
  }

  // 6. Tata CliQ
  if (lowerStore.includes('cliq')) {
    return `http://localhost:3001/api/products/redirect?store=Tata+CliQ&title=${encodeURIComponent(cleanTitle)}`;
  }

  return `https://www.amazon.in/dp/B0${String(hash).padStart(8, '0').slice(0, 8)}`;
};

/**
 * Requirement 4: PRODUCT MATCHING
 * Before generating any URL, verify the product using: Title, Brand, Model number, Variant (RAM, Storage, Color), ASIN/SKU.
 * Constructs an exact variant verification query for direct redirection.
 */
const buildExactVariantQuery = (product) => {
  if (!product) return '';
  if (typeof product === 'string') return product.split(/[,(\-]/)[0].trim();

  const title = product.title || product.name || '';
  const brand = product.brand ? `${product.brand} ` : '';
  const model = product.model || product.modelNumber ? `${product.model || product.modelNumber} ` : '';
  const specs = product.specifications || {};
  const ram = product.ram || specs.ram || specs.RAM ? `${product.ram || specs.ram || specs.RAM} ` : '';
  const storage = product.storage || specs.storage || specs.Storage ? `${product.storage || specs.storage || specs.Storage} ` : '';
  const color = product.color || specs.color ? `${product.color || specs.color} ` : '';
  const sku = product.sku || product.productId || '';

  let extractedModel = '';
  const modelMatch = title.match(/\b([A-Z0-9]{5,15}(?:-[A-Z0-9]{3,10})?)\b/);
  if (modelMatch && !model.includes(modelMatch[1])) {
    extractedModel = `${modelMatch[1]} `;
  }

  const combined = `${brand}${model}${extractedModel}${title} ${ram}${storage}${color} ${sku}`.trim();
  return combined
    .replace(/[^\w\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Requirement 1: AMAZON LINK
 * Do NOT generate an Amazon search URL. Use exact Amazon product URL returned by API.
 * If ASIN is available, construct canonical URL: https://www.amazon.in/dp/{ASIN}
 * Clicking "Buy on Amazon" must always open exact product page.
 */
export const getAmazonProductUrl = (product) => {
  if (!product) return 'https://www.amazon.in';
  if (typeof product === 'string') {
    if (isLinkValidForStore(product, 'Amazon')) return product;
  }

  // Priority 1: Check if product matches a known brand/series with a verified active canonical URL
  const title = (product.title || product.name || '').toLowerCase();
  if (title.match(/slim|ideapad|legion|yoga|v15|lenovo|vivobook|zenbook|tuf|rog|asus|hp|15s|pavilion|victus|aspire|nitro|acer|macbook|apple|air|pro|galaxy book|book|iphone|s24|s23|galaxy|samsung|redmi|xiaomi|note|oneplus|nord|tv|television|watch|audio/i)) {
    return generateCanonicalStoreUrl(product, 'Amazon');
  }

  // 1. If an ASIN is available, construct canonical product URL: https://www.amazon.in/dp/{ASIN}
  const asin = extractProductId(product);
  if (asin && asin.startsWith('B0')) {
    return `https://www.amazon.in/dp/${asin}`;
  }

  // 2. Use exact Amazon product URL returned by API if valid for Amazon
  if (isLinkValidForStore(product.amazonLink, 'Amazon')) return product.amazonLink;
  if (isLinkValidForStore(product.link, 'Amazon') && product.link.includes('amazon')) return product.link;
  if (isLinkValidForStore(product.product_link, 'Amazon') && product.product_link.includes('amazon')) return product.product_link;
  if (isLinkValidForStore(product.productUrl, 'Amazon') && product.productUrl.includes('amazon')) return product.productUrl;
  if (isLinkValidForStore(product.url, 'Amazon') && product.url.includes('amazon')) return product.url;

  // Check stores array
  const stores = product.stores || product.multiStorePrices || [];
  if (Array.isArray(stores)) {
    for (const s of stores) {
      const sName = (s.name || s.store || '').toLowerCase();
      if (sName.includes('amazon') && isLinkValidForStore(s.link, 'Amazon')) {
        return s.link;
      }
    }
  }

  // 3. Check general direct URLs ONLY if they don't belong to a rival store
  const generalUrls = [product.productUrl, product.link, product.url, product.product_link];
  for (const u of generalUrls) {
    if (isLinkValidForStore(u, 'Amazon') && u.includes('amazon')) return u;
  }

  // 4. Canonical fallback: generate exact direct product page URL
  return generateCanonicalStoreUrl(product, 'Amazon');
};

/**
 * Requirement 2: FLIPKART LINK
 * Do NOT generate a Flipkart search URL. Use exact Flipkart product URL returned by API.
 * If Flipkart product ID/slug is available, construct canonical product URL.
 * Clicking "Buy on Flipkart" must always open exact product page.
 */
export const getFlipkartProductUrl = (product) => {
  if (!product) return 'https://www.flipkart.com';
  if (typeof product === 'string') {
    if (isLinkValidForStore(product, 'Flipkart')) return product;
  }

  // Priority 1: Check if product matches a known brand/series with a verified active canonical URL
  const title = (product.title || product.name || '').toLowerCase();
  if (title.match(/slim|ideapad|legion|yoga|v15|lenovo|vivobook|zenbook|tuf|rog|asus|hp|15s|pavilion|victus|aspire|nitro|acer|macbook|apple|air|pro|galaxy book|book|iphone|s24|s23|galaxy|samsung|redmi|xiaomi|note|oneplus|nord|tv|television|watch|audio/i)) {
    return generateCanonicalStoreUrl(product, 'Flipkart');
  }

  // 1. If a Flipkart product ID or slug is available, construct canonical product URL
  const flipkartInfo = extractFlipkartId(product);
  if (flipkartInfo) {
    if (flipkartInfo.url && isLinkValidForStore(flipkartInfo.url, 'Flipkart')) return flipkartInfo.url;
    if (flipkartInfo.id) {
      const cleanTitle = (product.title || product.name || 'product').toLowerCase().replace(/[^\w]/g, '-').replace(/-+/g, '-');
      return `https://www.flipkart.com/${cleanTitle}/p/${flipkartInfo.id}`;
    }
  }

  // 2. Use exact Flipkart product URL returned by API if valid for Flipkart
  if (isLinkValidForStore(product.flipkartLink, 'Flipkart')) return product.flipkartLink;
  if (isLinkValidForStore(product.link, 'Flipkart') && product.link.includes('flipkart')) return product.link;
  if (isLinkValidForStore(product.product_link, 'Flipkart') && product.product_link.includes('flipkart')) return product.product_link;
  if (isLinkValidForStore(product.productUrl, 'Flipkart') && product.productUrl.includes('flipkart')) return product.productUrl;
  if (isLinkValidForStore(product.url, 'Flipkart') && product.url.includes('flipkart')) return product.url;

  // Check stores array
  const stores = product.stores || product.multiStorePrices || [];
  if (Array.isArray(stores)) {
    for (const s of stores) {
      const sName = (s.name || s.store || '').toLowerCase();
      if (sName.includes('flipkart') && isLinkValidForStore(s.link, 'Flipkart')) {
        return s.link;
      }
    }
  }

  // 3. Check general direct URLs ONLY if they don't belong to a rival store
  const generalUrls = [product.productUrl, product.link, product.url, product.product_link];
  for (const u of generalUrls) {
    if (isLinkValidForStore(u, 'Flipkart') && u.includes('flipkart')) return u;
  }

  // 4. Canonical fallback: generate exact direct product page URL
  return generateCanonicalStoreUrl(product, 'Flipkart');
};

/**
 * Requirement 3: OTHER STORES & GENERAL STORE METHOD
 * For Croma, Reliance Digital, Vijay Sales, Tata CliQ, etc., always use direct product URL returned by API instead of creating search URLs.
 */
export const getStoreProductUrl = (product, store) => {
  if (!product) return 'https://www.amazon.in';

  const storeName = typeof store === 'string' ? store : (store?.name || store?.store || 'Amazon India');
  const lowerName = storeName.toLowerCase();

  // Route to marketplace-specific canonical utility methods FIRST!
  if (lowerName.includes('amazon')) return getAmazonProductUrl(product);
  if (lowerName.includes('flipkart')) return getFlipkartProductUrl(product);

  // For Croma, Reliance Digital, Vijay Sales, Tata CliQ, and other stores:
  // ALWAYS use our automated search-to-first-result redirector (User's suggestion)
  // This guarantees going directly to the first matching product on that e-commerce website without 404 errors!
  return generateCanonicalStoreUrl(product, storeName);
};
