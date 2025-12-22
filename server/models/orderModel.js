// server/models/orderModel.js
const pool = require('../config/db');

/**
 * Creates a new order record within a transaction.
 * Requires a PostgreSQL client object from a transaction.
 */
const createOrder = async (client, userId, totalAmount) => {
    const result = await client.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id, order_date, total_amount',
        [userId, totalAmount, 'Pending']
    );
    return result.rows[0];
};

/**
 * Inserts an order item record within a transaction.
 * Requires a PostgreSQL client object from a transaction.
 */
const createOrderItem = async (client, orderId, productId, quantity, priceAtPurchase) => {
    await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, productId, quantity, priceAtPurchase]
    );
};

module.exports = {
    createOrder,
    createOrderItem,
};