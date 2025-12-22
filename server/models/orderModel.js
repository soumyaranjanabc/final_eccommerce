import pool from "../config/db.js";

/**
 * Creates a new order record within a transaction.
 * Amounts are treated as ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
export const createOrder = async (client, userId, totalAmountInr) => {
  const result = await client.query(
    `INSERT INTO orders (user_id, total_amount, status)
     VALUES ($1, $2, $3)
     RETURNING id, order_date, total_amount`,
    [userId, totalAmountInr, "Pending"]
  );

  return result.rows[0];
};

/**
 * Inserts an order item record within a transaction.
 * priceAtPurchase is ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
export const createOrderItem = async (
  client,
  orderId,
  productId,
  quantity,
  priceAtPurchaseInr
) => {
  await client.query(
    `INSERT INTO order_items
     (order_id, product_id, quantity, price_at_purchase)
     VALUES ($1, $2, $3, $4)`,
    [orderId, productId, quantity, priceAtPurchaseInr]
  );
};
