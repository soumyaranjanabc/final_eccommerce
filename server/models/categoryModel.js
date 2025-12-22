import pool from "../config/db.js";

/**
 * Fetches all categories, including main and subcategories.
 */
export const findAllCategories = async () => {
  const result = await pool.query(
    "SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name ASC"
  );
  return result.rows;
};
