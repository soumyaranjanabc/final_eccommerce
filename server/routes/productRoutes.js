// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { isOwner } = require('../middleware/ownerAuthMiddleware');

router.get('/', productController.getAllProducts);

router.post('/manage', protect, isOwner, productController.manageProduct);
router.put('/manage/:id', protect, isOwner, productController.manageProduct);
router.delete('/manage/:id', protect, isOwner, productController.deleteProduct);

module.exports = router;
