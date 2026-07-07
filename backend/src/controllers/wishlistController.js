const prisma = require('../config/db');

/** POST /api/wishlist */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: { product: true },
    });

    return res.status(201).json({ success: true, message: 'Added to wishlist', item });
  } catch (error) {
    next(error);
  }
};

/** GET /api/wishlist */
const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/wishlist/:productId */
const removeFromWishlist = async (req, res, next) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    return res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

/** GET /api/history */
const getSearchHistory = async (req, res, next) => {
  try {
    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

/** GET /api/history/recent-views */
const getRecentlyViewed = async (req, res, next) => {
  try {
    const items = await prisma.recentlyViewed.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { viewedAt: 'desc' },
      take: 10,
    });
    return res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, getSearchHistory, getRecentlyViewed };
