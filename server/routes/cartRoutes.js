// server/routes/cartRoutes.js (UPDATED Import)
const express = require('express');
const router = express.Router();
// Changed reference from orderController to cartController
const cartController = require('../controllers/cartController'); 
const { protect } = require('../middleware/authMiddleware');

// Route to handle the checkout process
router.post('/checkout', protect, cartController.checkout);

module.exports = router;