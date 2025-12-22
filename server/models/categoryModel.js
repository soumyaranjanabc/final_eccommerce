// server/models/categoryModel.js
const pool = require('../config/db');

/**
 * Fetches all categories, including main and subcategories.
 */
const findAllCategories = async () => {
    const result = await pool.query('SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name ASC');
    return result.rows;
};

module.exports = {
    findAllCategories,
};