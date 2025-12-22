// server/models/productModel.js (UPDATED: Add Update Function)
const pool = require('../config/db');

// ... (findAllProducts, findProductById, updateProductStock functions remain the same) ...

/**
 * Updates an existing product's details in the database.
 */
const updateProduct = async (id, name, description, price, stockQuantity, imageUrl, categoryId) => {
    const result = await pool.query(
        `UPDATE products 
         SET name = $2, description = $3, price = $4, stock_quantity = $5, image_url = $6, category_id = $7
         WHERE id = $1 
         RETURNING *`,
        [id, name, description, price, stockQuantity, imageUrl, categoryId]
    );
    return result.rows[0];
};

/**
 * Deletes a product by ID.
 */
const deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};


module.exports = {
    // ... existing exports ...
    updateProduct, // <--- NEW EXPORT
    deleteProduct, // <--- NEW EXPORT
};