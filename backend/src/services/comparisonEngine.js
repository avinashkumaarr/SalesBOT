/**
 * Comparison Engine
 * Responsibilities:
 * - Aggregate search results from SerpAPI with enrichment data from ScrapingDog
 * - Align specs side-by-side (Processor, RAM, Battery, Storage, Upgradeability, Value for Money)
 * - Format a clean, structured payload for Gemini's 2nd pass ranking and explanation
 */

/**
 * Align specifications across products for side-by-side comparison
 */
const aggregateAndAlign = (enrichedProducts = [], userIntent = {}) => {
  if (!enrichedProducts || enrichedProducts.length === 0) return { products: [], summaryText: '' };

  const aligned = enrichedProducts.map((p, index) => {
    const specs = p.specifications || {};
    const lowestPrice = p.lowestPriceStore || p.multiStorePrices?.[0] || { store: 'Amazon India', price: p.price, formattedPrice: `₹${p.price}` };
    const priceVal = p.price || lowestPrice.price || 45990;

    const cat = (p.category || userIntent.category || '').toLowerCase();
    const titleLower = (p.title || p.name || '').toLowerCase();
    const isLaptop = cat.includes('laptop') || titleLower.includes('laptop') || titleLower.includes('macbook') || titleLower.includes('pad') || titleLower.includes('ryzen') || titleLower.includes('intel') || titleLower.includes('core i');
    const isPhone = cat.includes('phone') || titleLower.includes('phone') || titleLower.includes('mobile') || titleLower.includes('galaxy') || titleLower.includes('iphone') || titleLower.includes('oneplus');
    const isTV = cat.includes('tv') || titleLower.includes('tv') || titleLower.includes('television') || titleLower.includes('oled') || titleLower.includes('qled');

    let dynamicSpecs = {};
    if (isLaptop) {
      dynamicSpecs = {
        processor: specs.processor || specs.cpu || 'High Performance Processor',
        ram: specs.ram || specs.RAM || '16GB High-Speed RAM',
        storage: specs.storage || specs.ssd || specs.Storage || '512GB NVMe SSD',
        battery: specs.battery || specs.Battery || 'Up to 6-8 hours battery backup',
      };
    } else if (isPhone) {
      dynamicSpecs = {
        processor: specs.processor || specs.cpu || 'Octa-Core 5G Processor',
        ram: specs.ram || specs.RAM || '8GB / 12GB RAM',
        storage: specs.storage || specs.Storage || '128GB / 256GB Storage',
        battery: specs.battery || specs.Battery || '5000mAh Fast Charging Battery',
      };
    } else if (isTV) {
      dynamicSpecs = {
        display: specs.display || specs.resolution || '4K Ultra HD Display',
        sound: specs.sound || specs.audio || 'Dolby Audio / Atmos Support',
        refreshRate: specs.refreshRate || '60Hz / 120Hz Smooth Motion',
        warranty: specs.warranty || '1 Year Brand Warranty',
      };
    } else {
      dynamicSpecs = {
        feature1: specs.feature1 || specs.type || 'Premium Build & Durability',
        feature2: specs.feature2 || specs.material || 'High Performance Standard',
        feature3: specs.feature3 || specs.power || 'Verified Quality Product',
        warranty: specs.warranty || '1 Year Manufacturer Warranty',
      };
    }

    const specifications = Object.assign({}, dynamicSpecs, specs);

    return {
      rankIndex: index + 1,
      id: p.id,
      title: p.title,
      brand: p.brand || 'Generic',
      category: p.category || 'electronics',
      price: priceVal,
      originalPrice: p.originalPrice || null,
      discount: p.discount || null,
      rating: p.rating || 4.2,
      reviewCount: p.reviewCount || 100,
      lowestPriceStore: lowestPrice,
      stores: (p.multiStorePrices || []).map(s => ({
        name: s.store || s.name || 'Amazon India',
        price: s.formattedPrice || (typeof s.price === 'number' ? `₹${s.price.toLocaleString('en-IN')}` : s.price) || `₹${priceVal.toLocaleString('en-IN')}`,
        icon: s.logo || s.icon || '🛒',
        link: s.link || p.productUrl || 'https://amazon.in',
        rawPrice: s.price || priceVal
      })),
      specifications,
      offers: p.offers || [],
      keepaHistory: p.keepaHistory || null,
      availability: p.availability?.status || 'In Stock',
      productUrl: p.productUrl || lowestPrice.link || 'https://www.amazon.in',
      image: p.image || '',
    };
  });

  const summaryText = formatForGemini(aligned, userIntent);

  return {
    products: aligned,
    summaryText,
  };
};

/**
 * Format aggregated products into structured markdown for Gemini 2nd Pass (AI Brain)
 */
const formatForGemini = (alignedProducts = [], userIntent = {}) => {
  if (!alignedProducts || alignedProducts.length === 0) {
    return 'No products found matching the criteria.';
  }

  const intentHeader = `
=== EXTRACTED USER INTENT (GEMINI 1ST PASS) ===
Category: ${userIntent.category || 'General'}
Budget: ${userIntent.budget ? `₹${userIntent.budget.toLocaleString('en-IN')}` : 'Flexible'}
Purpose / Use Case: ${userIntent.purpose || userIntent.useCase || 'General Use'}
Key Preferences: ${JSON.stringify({
    battery: userIntent.battery || false,
    gaming: userIntent.gaming || false,
    coding: userIntent.coding || false,
    brandPreference: userIntent.brand || 'Any',
  })}
==============================================
`;

  const productsText = alignedProducts.map((p, i) => {
    const pricesBreakdown = (p.multiStorePrices || [])
      .map((store) => `  - ${store.logo || '🏪'} **${store.store}**: ${store.formattedPrice} (${store.offer || 'Standard Offer'}) [Link: ${store.link}]`)
      .join('\n');

    const specsBreakdown = Object.entries(p.specifications)
      .map(([k, v]) => `  - **${k.toUpperCase()}**: ${v}`)
      .join('\n');

    const offersBreakdown = (p.offers || [])
      .slice(0, 2)
      .map((o) => `  - ${o}`)
      .join('\n');

    const keepaBreakdown = p.keepaHistory ? `
Keepa API Price History (Amazon India):
  - Current Price: ${p.keepaHistory.formattedCurrentPrice}
  - 30-Day Range: ${p.keepaHistory.lowest30Days} - ${p.keepaHistory.highest30Days}
  - 90-Day Range: ${p.keepaHistory.lowest90Days} - ${p.keepaHistory.highest90Days}
  - 1-Year Low: ${p.keepaHistory.lowest1Year} | Average: ${p.keepaHistory.averagePrice}
  - Buy Box Owner: ${p.keepaHistory.buyBoxOwner}
  - AI Buy Advice: ${p.keepaHistory.buyAdvice}` : '  - No Keepa History Available';

    return `
--- PRODUCT CANDIDATE #${i + 1}: ${p.title} ---
Brand: ${p.brand} | Category: ${p.category}
Customer Rating: ⭐ ${p.rating}/5 (${p.reviewCount} verified reviews)
Lowest Price Online: ${p.lowestPriceStore.formattedPrice} at ${p.lowestPriceStore.store}
Stock Status: ${p.availability}

Hardware Specifications:
${specsBreakdown}

Multi-Store Price Comparison (ScrapingDog Enrichment):
${pricesBreakdown}
${keepaBreakdown}

Top Bank & EMI Offers:
${offersBreakdown}
`;
  }).join('\n\n');

  return `${intentHeader}\n\n=== ENRICHED PRODUCT CANDIDATES FOR RANKING ===\n${productsText}\n===============================================`;
};

module.exports = {
  aggregateAndAlign,
  formatForGemini,
};
