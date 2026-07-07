const express = require('express');
const router = express.Router();
const { getPriceComparison, getReviews } = require('../controllers/productController');

router.get('/price/:productId', getPriceComparison);
router.get('/reviews/:productId', getReviews);

module.exports = router;
