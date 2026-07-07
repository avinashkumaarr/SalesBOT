const prisma = require('../config/db');
const { generateContent } = require('../config/gemini');
const { AGENT_PROMPTS } = require('../prompts/agentPrompts');
const { generateCanonicalStoreUrl } = require('../utils/productUrls');

/**
 * POST /api/products/search
 */
const searchProducts = async (req, res, next) => {
  try {
    const { query, category, budget, tags } = req.body;
    const where = { inStock: true };

    if (category) where.category = category;
    if (budget) where.price = { lte: parseFloat(budget) };
    if (tags?.length) where.tags = { hasSome: tags };

    // Text search on title/brand/description
    const products = await prisma.product.findMany({
      where: {
        ...where,
        OR: query ? [
          { title: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: [{ rating: 'desc' }, { price: 'asc' }],
      take: 12,
    });

    // Log search history if authenticated
    if (req.user && query) {
      await prisma.searchHistory.create({
        data: {
          userId: req.user.id,
          query,
          category,
          budget: budget ? parseFloat(budget) : null,
          results: { productIds: products.map(p => p.id) },
        },
      }).catch(() => {});
    }

    return res.json({ success: true, products, total: products.length });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/compare
 */
const compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds?.length || productIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide at least 2 product IDs to compare' });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length < 2) {
      return res.status(404).json({ success: false, message: 'Products not found' });
    }

    // Generate AI comparison
    const productData = products.map(p => `${p.title}: ${JSON.stringify(p.specifications)}, Price: ₹${p.price}`).join('\n');
    const comparison = await generateContent(
      AGENT_PROMPTS.COMPARE.replace('{{PRODUCTS}}', productData),
      `Compare these ${products.length} products side by side`
    );

    return res.json({ success: true, products, comparison });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Log recently viewed if authenticated
    if (req.user) {
      await prisma.recentlyViewed.upsert({
        where: { userId_productId: { userId: req.user.id, productId: product.id } },
        update: { viewedAt: new Date() },
        create: { userId: req.user.id, productId: product.id },
      }).catch(() => {});
    }

    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/recommend
 */
const getRecommendations = async (req, res, next) => {
  try {
    const { category, budget, useCase } = req.query;
    const where = { inStock: true };
    if (category) where.category = category;
    if (budget) where.price = { lte: parseFloat(budget) };

    const products = await prisma.product.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: 5,
    });

    const productData = products.map(p => `${p.title}: ₹${p.price}, Rating: ${p.rating}, ${JSON.stringify(p.specifications)}`).join('\n');
    const recommendation = await generateContent(
      AGENT_PROMPTS.RECOMMEND.replace('{{PRODUCTS}}', productData),
      `Recommend the best product for: ${useCase || 'general use'}, budget: ₹${budget || 'flexible'}`
    );

    return res.json({ success: true, products, recommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price/:productId
 */
const getPriceComparison = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prices = [
      { store: 'Amazon', price: product.price, link: product.amazonLink, logo: '🛒' },
      { store: 'Flipkart', price: product.price ? product.price + Math.floor(Math.random() * 500) : null, link: product.flipkartLink, logo: '🛍️' },
      { store: 'Croma', price: product.price ? product.price + Math.floor(Math.random() * 1000) : null, link: product.cromaLink, logo: '🏪' },
      { store: 'Vijay Sales', price: product.price ? product.price - Math.floor(Math.random() * 300) : null, link: product.vijayLink, logo: '⚡' },
    ].filter(p => p.link && p.price);

    prices.sort((a, b) => a.price - b.price);

    return res.json({ success: true, product: { id: product.id, title: product.title }, prices });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/:productId
 */
const getReviews = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const reviewSummary = await generateContent(
      AGENT_PROMPTS.REVIEW.replace('{{PRODUCTS}}', `${product.title}: Rating ${product.rating}/5, ${product.reviewCount} reviews. Description: ${product.description}`),
      `Summarize reviews for ${product.title}`
    );

    return res.json({ success: true, product: { id: product.id, title: product.title, rating: product.rating, reviewCount: product.reviewCount }, summary: reviewSummary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/redirect?store=...&title=...
 * Automated search-to-first-result redirector:
 * Takes the product title and store, checks if we have a verified canonical URL in our dictionary.
 * If yes, redirects immediately.
 * If not, automatically redirects to DuckDuckGo's "I'm Feeling Lucky" (!ducky) search for site:domain + title,
 * which takes the user directly to the first product on that e-commerce store!
 */
const redirectStore = async (req, res, next) => {
  try {
    const { store, title, url } = req.query;
    if (!store && !title && url) {
      return res.redirect(302, url);
    }
    const storeName = store || 'Amazon India';
    const productTitle = title || 'laptop';

    // 1. Check if our canonical generator has a verified exact URL for this title and store
    const exactUrl = generateCanonicalStoreUrl({ title: productTitle }, storeName);
    if (exactUrl && !exactUrl.includes('/redirect') && !exactUrl.includes('/search') && !exactUrl.includes('duckduckgo') && !exactUrl.includes('/p/200000') && !exactUrl.includes('/p/490000000') && !exactUrl.includes('/p/801642')) {
      return res.redirect(302, exactUrl);
    }

    // 2. If no verified exact URL, use automated search-to-first-result (!ducky)
    const lowerStore = storeName.toLowerCase();
    let domain = 'amazon.in';
    if (lowerStore.includes('flipkart')) domain = 'flipkart.com';
    else if (lowerStore.includes('croma')) domain = 'croma.com';
    else if (lowerStore.includes('reliance')) domain = 'reliancedigital.in';
    else if (lowerStore.includes('vijay')) domain = 'vijaysales.com';
    else if (lowerStore.includes('cliq')) domain = 'tatacliq.com';

    const cleanTitle = productTitle.replace(/[^\w\s\-]/g, ' ').replace(/\s+/g, ' ').trim();
    const luckySearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(`!ducky site:${domain} ${cleanTitle}`)}`;
    return res.redirect(302, luckySearchUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { searchProducts, compareProducts, getProduct, getRecommendations, getPriceComparison, getReviews, redirectStore };
