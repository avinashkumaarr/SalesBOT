const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getSearchHistory,
  getRecentlyViewed,
} = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/wishlist', addToWishlist);
router.get('/wishlist', getWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

router.get('/history', getSearchHistory);
router.get('/history/recent-views', getRecentlyViewed);

module.exports = router;
