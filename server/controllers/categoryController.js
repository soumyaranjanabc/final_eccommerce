// server/controllers/categoryController.js
const categoryModel = require('../models/categoryModel');

// @route   GET /api/categories
// @desc    Get all categories and subcategories
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.findAllCategories();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        res.status(500).json({ error: 'Server error while fetching categories.' });
    }
};

// You can add addCategory and deleteCategory methods here later.

module.exports = {
    getAllCategories,
};

