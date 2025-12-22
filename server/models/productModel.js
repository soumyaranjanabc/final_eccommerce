// server/models/productModel.js
const pool = require('../config/db');

/**
 * Fetch all products with category info
 */
const findAllProducts = async () => {
  const result = await pool.query(`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock_quantity,
      p.image_url,
      p.category_id,
      c.name AS category_name,
      p.created_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

/**
 * Create a new product
 */
const createProduct = async (
  name,
  description,
  price,
  stock_quantity,
  image_url,
  category_id
) => {
  const result = await pool.query(
    `INSERT INTO products
     (name, description, price, stock_quantity, image_url, category_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, price, stock_quantity, image_url, category_id]
  );
  return result.rows[0];
};

/**
 * Update an existing product
 */
const updateProduct = async (
  id,
  name,
  description,
  price,
  stock_quantity,
  image_url,
  category_id
) => {
  const result = await pool.query(
    `UPDATE products
     SET name=$1,
         description=$2,
         price=$3,
         stock_quantity=$4,
         image_url=$5,
         category_id=$6
     WHERE id=$7
     RETURNING *`,
    [name, description, price, stock_quantity, image_url, category_id, id]
  );
  return result.rows[0];
};

/**
 * Delete product
 */
const deleteProduct = async (id) => {
  await pool.query('DELETE FROM products WHERE id=$1', [id]);
};

module.exports = {
  findAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};