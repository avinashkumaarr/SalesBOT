const prisma = require('../config/db');
const { getAmazonProductUrl, getFlipkartProductUrl, getStoreProductUrl } = require('../utils/productUrls');

/**
 * Helper to parse price string or number into a clean float
 */
const parseNumericPrice = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return null;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * In-Memory Mock Product Catalog (Fail-safe fallback across ALL budget tiers and categories)
 */
const getInMemoryCatalog = ({ query, category, budget, limit = 5 }) => {
  console.log('📦 [SerpAPI Fallback] Using In-Memory Catalog across budget tiers...');
  const catalog = [
    // --- Budget Laptops (Under ₹35,000) ---
    {
      id: 'mock-laptop-budget-1',
      title: 'HP 15s, AMD Ryzen 3 5300U, 8GB RAM, 512GB SSD',
      brand: 'HP',
      category: 'laptop',
      price: 31990,
      originalPrice: 42990,
      discount: 25,
      rating: 4.2,
      reviewCount: 850,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B09U55H2LN',
      description: '15.6 inch FHD Display, Micro-edge, Anti-glare, Windows 11, Great battery backup for college students and light coding.',
      specifications: {
        processor: 'AMD Ryzen 3 5300U (4 Cores, Up to 3.8GHz)',
        ram: '8GB DDR4 RAM (Upgradable)',
        storage: '512GB PCIe NVMe SSD',
        gpu: 'AMD Radeon Graphics',
        display: '15.6 inch FHD IPS (1920x1080)',
        battery: '3-Cell 41Whr Li-ion, Up to 6 hours backup',
        warranty: '1 Year HP Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-budget-2',
      title: 'Lenovo IdeaPad Slim 1, AMD Ryzen 3 7320U, 8GB RAM, 512GB SSD',
      brand: 'Lenovo',
      category: 'laptop',
      price: 33490,
      originalPrice: 48990,
      discount: 31,
      rating: 4.1,
      reviewCount: 620,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Flipkart',
      productUrl: 'https://www.flipkart.com/lenovo-ideapad-slim-3-intel-core-i3-13th-gen-1305u-8-gb-512-gb-ssd-windows-11-home-15iru8-thin-light-laptop/p/itm0da6a82c011e2',
      description: 'Ultra-thin lightweight laptop, Cloud Grey, Dolby Audio, Rapid Charge, ideal for students on a budget.',
      specifications: {
        processor: 'AMD Ryzen 3 7320U (4 Cores, Up to 4.1GHz)',
        ram: '8GB LPDDR5 RAM',
        storage: '512GB NVMe SSD',
        gpu: 'AMD Radeon 610M Graphics',
        display: '15.6 inch FHD Anti-Glare',
        battery: '42Whr Battery, Up to 7 hours backup',
        warranty: '1 Year Lenovo Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- 40k Budget Laptops (Strictly ₹36,000 - ₹39,990) ---
    {
      id: 'mock-laptop-40k-1',
      title: 'ASUS Vivobook Go 15, AMD Ryzen 5 7520U, 16GB RAM, 512GB SSD',
      brand: 'ASUS',
      category: 'laptop',
      price: 38990,
      originalPrice: 54990,
      discount: 29,
      rating: 4.4,
      reviewCount: 1850,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C1GGPRQ6',
      description: '15.6 inch FHD Anti-Glare Display, 16GB RAM for smooth coding & Android Studio, Windows 11, Fast Charging battery.',
      specifications: {
        processor: 'AMD Ryzen 5 7520U (Quad-Core, Up to 4.3GHz)',
        ram: '16GB LPDDR5 RAM',
        storage: '512GB PCIe NVMe SSD',
        gpu: 'AMD Radeon Graphics',
        display: '15.6 inch FHD (1920x1080) Eye Care Display',
        battery: '42Whr Battery, Up to 7 hours backup + Fast Charge',
        warranty: '1 Year ASUS Domestic Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-40k-2',
      title: 'Lenovo IdeaPad Slim 3, Intel Core i3 13th Gen, 16GB RAM, 512GB SSD',
      brand: 'Lenovo',
      category: 'laptop',
      price: 39490,
      originalPrice: 52990,
      discount: 25,
      rating: 4.3,
      reviewCount: 1420,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Flipkart',
      productUrl: 'https://www.flipkart.com/lenovo-ideapad-slim-3-intel-core-i3-13th-gen-1305u-8-gb-512-gb-ssd-windows-11-home-15iru8-thin-light-laptop/p/itm0da6a82c011e2',
      description: '13th Gen Intel processor with 16GB RAM under ₹40,000! Lightweight design, backlit keyboard, rapid charge.',
      specifications: {
        processor: 'Intel Core i3-1305U (13th Gen, Up to 4.5GHz)',
        ram: '16GB LPDDR5 4800MHz',
        storage: '512GB NVMe M.2 SSD',
        gpu: 'Intel UHD Graphics',
        display: '15.6 inch FHD IPS Anti-Glare',
        battery: '47Whr Battery, Up to 8 hours backup',
        warranty: '1 Year Lenovo Premier Support',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-40k-3',
      title: 'Acer Aspire Lite, AMD Ryzen 5 5500U, 16GB RAM, 512GB SSD',
      brand: 'Acer',
      category: 'laptop',
      price: 37990,
      originalPrice: 49990,
      discount: 24,
      rating: 4.2,
      reviewCount: 930,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C8PYZ6PZ',
      description: 'Hexa-core Ryzen 5 processor with 16GB RAM at an unbeatable price under ₹38,000. Premium metal body.',
      specifications: {
        processor: 'AMD Ryzen 5 5500U (6 Cores, 12 Threads, Up to 4.0GHz)',
        ram: '16GB DDR4 RAM (Dual Channel)',
        storage: '512GB PCIe NVMe SSD',
        gpu: 'AMD Radeon Graphics',
        display: '15.6 inch Full HD Ultra-Slim',
        battery: '45Whr Li-Polymer Battery, Up to 6.5 hours',
        warranty: '1 Year Acer Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- Mid-Range Coding Laptops (₹45,000 - ₹55,000) ---
    {
      id: 'mock-laptop-mid-1',
      title: 'ASUS Vivobook 15 (2024), Intel Core i5 13th Gen, 16GB RAM, 512GB SSD',
      brand: 'ASUS',
      category: 'laptop',
      price: 45990,
      originalPrice: 62990,
      discount: 27,
      rating: 4.4,
      reviewCount: 1420,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C1GHKX58',
      description: 'Thin and Light Laptop, 15.6 inch FHD Anti-Glare, Windows 11, Backlit KB, 42Whr Battery, Good for Coding & Android Studio.',
      specifications: {
        processor: 'Intel Core i5 1335U (13th Gen, Up to 4.6GHz)',
        ram: '16GB DDR4 (Dual Channel, Upgradable up to 24GB)',
        storage: '512GB PCIe NVMe M.2 SSD',
        gpu: 'Integrated Intel Iris Xe Graphics',
        display: '15.6 inch FHD IPS, 250 nits',
        battery: '3-Cell 42Whr Li-ion, Up to 6-7 hours real-world backup',
        warranty: '1 Year ASUS Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-mid-2',
      title: 'Lenovo IdeaPad Slim 3, Intel Core i5 12th Gen, 16GB RAM, 512GB SSD',
      brand: 'Lenovo',
      category: 'laptop',
      price: 43990,
      originalPrice: 60990,
      discount: 28,
      rating: 4.2,
      reviewCount: 2100,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0BY8MCQDF',
      description: '15.6 inch FHD Lightweight Laptop, Rapid Charge, Backlit Keyboard, Privacy Shutter, Perfect for College Students and Programming.',
      specifications: {
        processor: 'Intel Core i5 1235U (10 Cores, Up to 4.4GHz)',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        gpu: 'Intel Iris Xe Graphics',
        display: '15.6 inch FHD TN (1920x1080)',
        battery: '38Whr Battery, Up to 5 hours backup',
        warranty: '1 Year Lenovo Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- 60k Budget Tier (₹54,000 - ₹62,000) — Perfect for coding, OLED & light gaming ---
    {
      id: 'mock-laptop-60k-1',
      title: 'Lenovo IdeaPad Slim 5 (OLED), AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD',
      brand: 'Lenovo',
      category: 'laptop',
      price: 59990,
      originalPrice: 79990,
      discount: 25,
      rating: 4.5,
      reviewCount: 1650,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Flipkart',
      productUrl: 'https://www.flipkart.com/lenovo-ideapad-slim-5-wuxga-oled-copilot-pc-full-metal-body-amd-ryzen-ai-7-octa-core-350-24-gb-1-tb-ssd-windows-11-home-14akp10-thin-light-laptop/p/itm078f4ceaf6192',
      description: '14/15.6 inch FHD OLED Display, 16GB RAM, Aluminum body, Backlit KB, 1080p FHD camera, up to 9 hours battery backup. Ultimate coding & media machine.',
      specifications: {
        processor: 'AMD Ryzen 7 7730U (8 Cores, 16 Threads, Up to 4.5GHz)',
        ram: '16GB LPDDR4x 4266MHz',
        storage: '512GB PCIe NVMe M.2 SSD',
        gpu: 'AMD Radeon Graphics',
        display: '15.6 inch WUXGA OLED (1920x1200) 100% DCI-P3 400 nits',
        battery: '56Whr Battery, Up to 9 hours real-world backup + Rapid Charge',
        warranty: '1 Year Lenovo Premium Care Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-60k-2',
      title: 'ASUS Vivobook 16X OLED, AMD Ryzen 7 5800H, 16GB RAM, 512GB SSD',
      brand: 'ASUS',
      category: 'laptop',
      price: 57990,
      originalPrice: 76990,
      discount: 25,
      rating: 4.5,
      reviewCount: 2200,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C1GJX9S6',
      description: '16-inch 4K/FHD+ OLED Display, Hexa-core H-series processor for heavy coding, Docker, Android Studio, Privacy shutter.',
      specifications: {
        processor: 'AMD Ryzen 7 5800H (8 Cores, 16 Threads, High Performance H-Series)',
        ram: '16GB DDR4 (Upgradable to 24GB)',
        storage: '512GB PCIe 3.0 NVMe SSD',
        gpu: 'AMD Radeon Vega 8 Graphics',
        display: '16.0 inch WUXGA (1920x1200) OLED 16:10 aspect ratio',
        battery: '50Whr 3-Cell Li-ion, Up to 7 hours backup',
        warranty: '1 Year ASUS Domestic Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-60k-3',
      title: 'HP Pavilion 15 (2024), Intel Core i5 13th Gen, 16GB RAM, 512GB SSD',
      brand: 'HP',
      category: 'laptop',
      price: 56990,
      originalPrice: 74990,
      discount: 24,
      rating: 4.4,
      reviewCount: 1890,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C3RGT964',
      description: '13th Gen Intel Core i5 processor, B&O Audio, Eye-safe FHD IPS Display, Backlit KB, Fast Charge, great for developers.',
      specifications: {
        processor: 'Intel Core i5-1335U (10 Cores, 12 Threads, Up to 4.6GHz)',
        ram: '16GB DDR4 3200MHz',
        storage: '512GB PCIe NVMe M.2 SSD',
        gpu: 'Intel Iris Xe Graphics',
        display: '15.6 inch FHD IPS Anti-Glare Micro-Edge',
        battery: '41Whr Li-ion, Up to 6.5 hours + HP Fast Charge (50% in 45 mins)',
        warranty: '1 Year HP Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-60k-4',
      title: 'Acer Nitro V Gaming, Intel Core i5 13th Gen, RTX 2050 4GB, 16GB RAM, 512GB SSD',
      brand: 'Acer',
      category: 'laptop',
      price: 58990,
      originalPrice: 77990,
      discount: 24,
      rating: 4.3,
      reviewCount: 1120,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Vijay Sales',
      productUrl: 'https://www.vijaysales.com/acer-aspire-lite-12th-gen-intel-core-i5/p/554524',
      description: 'Dedicated NVIDIA RTX 2050 4GB GPU under ₹60,000! Ideal for AI/ML development, 3D rendering, CAD, and gaming.',
      specifications: {
        processor: 'Intel Core i5-13420H (8 Cores, Up to 4.6GHz)',
        ram: '16GB DDR5 5200MHz (Fastest in class)',
        storage: '512GB PCIe Gen 4 NVMe SSD',
        gpu: 'NVIDIA GeForce RTX 2050 4GB GDDR6 Dedicated GPU',
        display: '15.6 inch FHD IPS 144Hz Refresh Rate',
        battery: '57Whr Battery, Up to 5 hours backup under load',
        warranty: '1 Year Acer International Travelers Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- 70k Budget Tier (₹65,000 - ₹78,000) ---
    {
      id: 'mock-laptop-70k-1',
      title: 'ASUS TUF Gaming A15, AMD Ryzen 7 7735HS, RTX 3050 4GB, 16GB RAM, 512GB SSD',
      brand: 'ASUS',
      category: 'laptop',
      price: 68990,
      originalPrice: 92990,
      discount: 26,
      rating: 4.5,
      reviewCount: 1400,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0C4TW7328',
      description: 'AMD Ryzen 7 HS-Series CPU with RTX 3050 dedicated graphics. 90Whr monster battery for all-day coding & gaming.',
      specifications: {
        processor: 'AMD Ryzen 7 7735HS (8 Cores, 16 Threads, Up to 4.75GHz)',
        ram: '16GB DDR5 4800MHz',
        storage: '512GB PCIe 4.0 NVMe SSD',
        gpu: 'NVIDIA GeForce RTX 3050 4GB GDDR6',
        display: '15.6 inch FHD 144Hz Adaptive-Sync',
        battery: '90Whr 4-Cell Li-ion, Up to 10 hours video playback',
        warranty: '1 Year ASUS Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- High-End Gaming / Pro Laptops (₹80,000 - ₹1,10,000) ---
    {
      id: 'mock-laptop-high-1',
      title: 'ASUS TUF Gaming F15, Intel Core i7 13th Gen, RTX 4050 6GB, 16GB RAM, 1TB SSD',
      brand: 'ASUS',
      category: 'laptop',
      price: 84990,
      originalPrice: 114990,
      discount: 26,
      rating: 4.6,
      reviewCount: 940,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0BY8MCQDF',
      description: '15.6 inch FHD 144Hz Gaming Laptop, NVIDIA RTX 4050, 90Whr Battery, RGB Backlit KB, Military-Grade Toughness.',
      specifications: {
        processor: 'Intel Core i7 13620H (10 Cores, Up to 4.9GHz)',
        ram: '16GB DDR5 4800MHz (Upgradable to 32GB)',
        storage: '1TB PCIe 4.0 NVMe M.2 SSD',
        gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6',
        display: '15.6 inch FHD 144Hz sRGB 100%',
        battery: '90Whr 4-Cell Li-ion, Excellent Gaming Battery',
        warranty: '1 Year ASUS Onsite Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-laptop-high-2',
      title: 'MacBook Air M2, 8-Core CPU, 10-Core GPU, 16GB Unified Memory, 512GB SSD',
      brand: 'Apple',
      category: 'laptop',
      price: 99990,
      originalPrice: 129900,
      discount: 23,
      rating: 4.8,
      reviewCount: 3400,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Croma',
      productUrl: 'https://www.croma.com/apple-macbook-air-m2-chip-8gb-ram-256gb-ssd-mac-os-13-6-inch-/p/256605',
      description: '13.6-inch Liquid Retina Display, MagSafe 3, 18 hours battery life, ultimate performance for developers and creators.',
      specifications: {
        processor: 'Apple M2 Chip (8-Core CPU)',
        ram: '16GB Unified Memory',
        storage: '512GB Superfast SSD',
        gpu: '10-Core Apple GPU',
        display: '13.6-inch Liquid Retina with True Tone',
        battery: 'Up to 18 hours battery life',
        warranty: '1 Year Apple India Warranty',
      },
      source: 'IN_MEMORY_CATALOG',
    },
    // --- Smartphones (All Tiers) ---
    {
      id: 'mock-phone-budget',
      title: 'Redmi Note 13 5G, 8GB RAM, 256GB Storage',
      brand: 'Xiaomi',
      category: 'smartphone',
      price: 16999,
      originalPrice: 20999,
      discount: 19,
      rating: 4.3,
      reviewCount: 4500,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0CQG5C384',
      description: '6.67 inch FHD+ pOLED 120Hz, MediaTek Dimensity 6080, 108MP Camera, 5000mAh Battery.',
      specifications: { processor: 'Dimensity 6080 5G', ram: '8GB', storage: '256GB', battery: '5000mAh + 33W Fast Charge' },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-phone-mid',
      title: 'OnePlus Nord CE 4 5G, 8GB RAM, 256GB Storage',
      brand: 'OnePlus',
      category: 'smartphone',
      price: 26999,
      originalPrice: 29999,
      discount: 10,
      rating: 4.5,
      reviewCount: 3100,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Amazon India',
      productUrl: 'https://www.amazon.in/dp/B0CYT2PKZ7',
      description: 'Snapdragon 7 Gen 3, 100W SuperVOOC Fast Charging, 5500mAh Battery, 120Hz AMOLED.',
      specifications: { processor: 'Snapdragon 7 Gen 3', ram: '8GB', storage: '256GB', battery: '5500mAh + 100W Charging' },
      source: 'IN_MEMORY_CATALOG',
    },
    {
      id: 'mock-phone-high',
      title: 'iPhone 15 (128 GB) - Black',
      brand: 'Apple',
      category: 'smartphone',
      price: 66990,
      originalPrice: 79900,
      discount: 16,
      rating: 4.7,
      reviewCount: 8900,
      image: 'https://m.media-amazon.com/images/I/71c0GSxnEwL._SX679_.jpg',
      seller: 'Flipkart',
      productUrl: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itmc758509c31406',
      description: 'Dynamic Island, 48MP Main Camera, A16 Bionic chip, USB-C connector.',
      specifications: { processor: 'A16 Bionic Chip', ram: '6GB', storage: '128GB', battery: 'All-day battery life' },
      source: 'IN_MEMORY_CATALOG',
    }
  ];

  if (budget && !isNaN(budget)) {
    const maxB = parseFloat(budget); // STRICT budget! No 1.15x inflation!
    let filtered = catalog.filter((p) => p.price <= maxB);
    if (category && category.toLowerCase() !== 'general') {
      const catFiltered = filtered.filter((p) => p.category === category.toLowerCase());
      if (catFiltered.length > 0) filtered = catFiltered;
    }
    if (filtered.length > 0) {
      // Sort by how close the price is to the user's budget (highest specs within budget first)
      filtered.sort((a, b) => Math.abs(maxB - a.price) - Math.abs(maxB - b.price));
      return filtered.slice(0, limit);
    } else {
      console.warn(`⚠️ [InMemoryCatalog] No items strictly <= ₹${maxB}. Returning cheapest available items sorted by price.`);
      const sortedByPrice = [...catalog].sort((a, b) => a.price - b.price);
      if (category && category.toLowerCase() !== 'general') {
        const catSorted = sortedByPrice.filter((p) => p.category === category.toLowerCase());
        if (catSorted.length > 0) return catSorted.slice(0, limit);
      }
      return sortedByPrice.slice(0, limit);
    }
  }
  return catalog.slice(0, limit);
};

/**
 * Fallback: Search products from local PostgreSQL database (with In-Memory Catalog backup)
 */
const searchFromDatabase = async ({ query, category, budget, limit = 5 }) => {
  try {
    const where = { inStock: true };
    if (category) where.category = category.toLowerCase();
    if (budget && !isNaN(budget)) {
      where.price = { lte: parseFloat(budget) }; // STRICT budget!
    }

    let products = await prisma.product.findMany({
      where: {
        ...where,
        OR: query ? [
          { title: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: [{ rating: 'desc' }, { price: 'asc' }],
      take: limit,
    });

    if (!products || products.length === 0) {
      products = await prisma.product.findMany({
        where: budget ? { price: { lte: parseFloat(budget) }, inStock: true } : { inStock: true },
        orderBy: [{ rating: 'desc' }],
        take: limit,
      });
    }

    if (!products || products.length === 0) {
      return getInMemoryCatalog({ query, category, budget, limit });
    }

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand || 'Generic',
      category: p.category || 'electronics',
      price: p.price,
      originalPrice: p.originalPrice || null,
      discount: p.discount || null,
      rating: p.rating || 4.2,
      reviewCount: p.reviewCount || 150,
      image: p.image || '',
      seller: 'Amazon India',
      productUrl: getAmazonProductUrl(p),
      description: p.description || '',
      specifications: p.specifications || {},
      source: 'DATABASE_FALLBACK',
    }));
  } catch (err) {
    console.warn(`⚠️ [SerpAPI Fallback] Database search error (${err.message.split('\n')[0]}). Switching to In-Memory Catalog...`);
    return getInMemoryCatalog({ query, category, budget, limit });
  }
};


/**
 * Check products_cache in PostgreSQL (1 hour TTL)
 */
const getCachedProducts = async ({ query, category, budget, limit = 5 }) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const where = {
      lastUpdated: { gte: oneHourAgo },
    };
    if (category && category.toLowerCase() !== 'general') {
      where.category = category.toLowerCase();
    }
    if (budget && !isNaN(budget)) {
      where.price = { lte: parseFloat(budget) };
    }
    if (query) {
      where.productName = { contains: query, mode: 'insensitive' };
    }

    const cached = await prisma.productCache.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { price: 'asc' }],
      take: limit,
    });

    if (cached && cached.length > 0) {
      console.log(`📦 [ProductCache] Hit! Found ${cached.length} recently cached products in PostgreSQL.`);
      return cached.map(p => ({
        id: p.id,
        title: p.productName,
        brand: 'Cached',
        category: p.category || 'electronics',
        price: p.price,
        originalPrice: null,
        discount: null,
        rating: p.rating || 4.3,
        reviewCount: 150,
        image: p.image || '',
        seller: p.store || 'Amazon India',
        productUrl: getStoreProductUrl(p, p.store || 'Amazon India'),
        description: p.productName,
        specifications: p.specs || {},
        source: 'POSTGRES_CACHE',
      }));
    }
  } catch (err) {
    console.warn(`⚠️ [ProductCache] Error checking cache: ${err.message.split('\n')[0]}`);
  }
  return null;
};

/**
 * Save products to products_cache in PostgreSQL
 */
const saveToProductCache = async (products, category) => {
  try {
    if (!products || products.length === 0) return;
    for (const p of products) {
      if (!p.title) continue;
      await prisma.productCache.upsert({
        where: { productName: p.title.slice(0, 190) },
        update: {
          price: p.price || 45990,
          rating: p.rating || 4.3,
          store: p.seller || p.source || 'Amazon India',
          image: p.image || '',
          url: p.productUrl || '',
          category: (category || p.category || 'electronics').toLowerCase(),
          specs: p.specifications || {},
          lastUpdated: new Date(),
        },
        create: {
          productName: p.title.slice(0, 190),
          price: p.price || 45990,
          rating: p.rating || 4.3,
          store: p.seller || p.source || 'Amazon India',
          image: p.image || '',
          url: p.productUrl || '',
          category: (category || p.category || 'electronics').toLowerCase(),
          specs: p.specifications || {},
        },
      });
    }
    console.log(`💾 [ProductCache] Cached ${products.length} products to PostgreSQL.`);
  } catch (err) {
    console.warn(`⚠️ [ProductCache] Error saving to cache: ${err.message.split('\n')[0]}`);
  }
};

/**
 * Primary Service: Search Google Shopping via SerpAPI
 * Responsibilities:
 * - Search for relevant products based on query / intent
 * - Return product name, price, rating, image, product URL, seller
 * - Automatically fallback to PostgreSQL if SERPAPI_KEY is missing or fails
 */
const searchProducts = async ({ query, category, budget, limit = 5 }) => {
  // 1. Check PostgreSQL products_cache first!
  const cachedResults = await getCachedProducts({ query, category, budget, limit });
  if (cachedResults && cachedResults.length > 0) {
    return cachedResults;
  }

  const apiKey = process.env.SERPAPI_KEY?.trim();

  // If no API key provided, seamlessly use database fallback
  if (!apiKey) {
    console.log('ℹ️ [SerpAPI] No SERPAPI_KEY found in .env. Using Hybrid Database Fallback.');
    const dbResults = await searchFromDatabase({ query, category, budget, limit });
    saveToProductCache(dbResults, category).catch(() => {});
    return dbResults;
  }

  try {
    let searchQuery = query || `${category || 'laptop'} under ${budget || '50000'}`;
    if (budget && !isNaN(budget) && !searchQuery.toLowerCase().includes('under') && !searchQuery.includes(String(budget))) {
      searchQuery += ` under ₹${budget}`;
    }
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&gl=in&hl=en`;

    console.log(`🔍 [SerpAPI] Fetching Google Shopping results for: "${searchQuery}"...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`SerpAPI HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const results = data.shopping_results || [];

    if (results.length === 0) {
      console.warn('⚠️ [SerpAPI] No shopping results returned from Google Shopping. Using database fallback.');
      const fallbackResults = await searchFromDatabase({ query, category, budget, limit });
      saveToProductCache(fallbackResults, category).catch(() => {});
      return fallbackResults;
    }

    // Parse and standardize SerpAPI results
    const parsedProducts = results.slice(0, limit * 2).map((item, idx) => {
      const price = parseNumericPrice(item.extracted_price || item.price) || 45990;
      return {
        id: item.product_id || item.docid || `serp-${idx}-${Date.now()}`,
        title: item.title || 'Unknown Product',
        brand: item.source || 'Generic',
        category: category || 'electronics',
        price: price,
        originalPrice: null,
        discount: null,
        rating: parseNumericPrice(item.rating) || 4.3,
        reviewCount: parseInt(item.reviews) || 120,
        image: item.thumbnail || '',
        seller: item.source || item.merchant || 'Amazon India',
        productUrl: getStoreProductUrl(item, item.source || item.merchant || 'Amazon India'),
        description: item.snippet || item.title || '',
        specifications: {},
        source: 'SERPAPI_LIVE',
      };
    });

    // Filter by budget if specified
    let filtered = parsedProducts;
    if (budget && !isNaN(budget)) {
      const maxBudget = parseFloat(budget); // STRICT budget! No 1.15x inflation!
      const withinBudget = parsedProducts.filter((p) => p.price <= maxBudget);
      if (withinBudget.length > 0) {
        filtered = withinBudget;
      } else {
        console.warn(`⚠️ [SerpAPI] Google Shopping returned no products strictly <= ₹${maxBudget}. Falling back to Database/Catalog to ensure strict budget adherence.`);
        const dbFiltered = await searchFromDatabase({ query, category, budget, limit });
        saveToProductCache(dbFiltered, category).catch(() => {});
        return dbFiltered;
      }
    }

    console.log(`✅ [SerpAPI] Successfully fetched ${Math.min(filtered.length, limit)} live products from Google Shopping.`);
    const finalResults = filtered.slice(0, limit);
    saveToProductCache(finalResults, category).catch(() => {});
    return finalResults;
  } catch (error) {
    console.warn(`⚠️ [SerpAPI] Error fetching live results (${error.message}). Switching to Hybrid Database Fallback...`);
    const errResults = await searchFromDatabase({ query, category, budget, limit });
    saveToProductCache(errResults, category).catch(() => {});
    return errResults;
  }
};

module.exports = {
  searchProducts,
  searchFromDatabase,
  getCachedProducts,
  saveToProductCache,
};
