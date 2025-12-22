// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public route: Fetch all categories
router.get('/', categoryController.getAllCategories);

module.exports = router;