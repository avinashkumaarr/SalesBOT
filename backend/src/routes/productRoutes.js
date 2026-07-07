const express = require('express');
const router = express.Router();
const {
  searchProducts,
  compareProducts,
  getProduct,
  getRecommendations,
  getPriceComparison,
  getReviews,
  redirectStore,
} = require('../controllers/productController');

router.post('/search', searchProducts);
router.post('/compare', compareProducts);
router.get('/recommend', getRecommendations);
router.get('/redirect', redirectStore);
router.get('/:id', getProduct);

module.exports = router;
