// server/controllers/orderController.js
const pool = require('../config/db');
const { sendOrderConfirmation } = require('./emailController');

// @route   POST /api/orders/checkout
// @desc    Process order, create records, and send email (Protected)
const checkout = async (req, res) => {
    const { items, totalAmount } = req.body;
    const userId = req.userId; // Set by the 'protect' middleware

    if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
    }
    
    // --- Start Transaction ---
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Fetch user email for confirmation email
        const userResult = await client.query('SELECT email, name FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found.');
        }
        const userEmail = userResult.rows[0].email;
        const userName = userResult.rows[0].name;

        // 2. Create the Order record
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id, order_date, total_amount',
            [userId, totalAmount, 'Pending']
        );
        const order = orderResult.rows[0];
        const orderId = order.id;

        // 3. Process each item: insert, check stock, and update stock
        const itemDetailsForEmail = []; // To store details needed for the confirmation email
        
        const orderItemPromises = items.map(async (item) => {
            const { productId, quantity, price } = item;

            // Fetch product details for current stock and name
            const productResult = await client.query('SELECT name, stock_quantity FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length === 0) {
                 throw new Error(`Product ID ${productId} not found.`);
            }
            const { name, stock_quantity: currentStock } = productResult.rows[0];

            if (currentStock < quantity) {
                 // Throw error to trigger rollback
                 throw new Error(`Insufficient stock: Only ${currentStock} of ${name} remain.`);
            }

            // Insert into order_items
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, productId, quantity, price]
            );

            // Update product stock (decrement)
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [quantity, productId]
            );

            itemDetailsForEmail.push({ 
                name, 
                quantity, 
                price 
            });
        });

        // Wait for all database operations to complete successfully
        await Promise.all(orderItemPromises);

        // 4. Commit the transaction
        await client.query('COMMIT');

        // 5. Send order confirmation email
        await sendOrderConfirmation(userEmail, order, itemDetailsForEmail);

        // Send successful response to client
        res.status(200).json({ 
            message: 'Order placed successfully and confirmation email sent.',
            orderId: orderId,
            totalAmount: totalAmount,
            orderDate: order.order_date,
            userName: userName,
            items: itemDetailsForEmail
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback on any error
        console.error('Checkout error:', error.message);
        // Send a specific error message back to the frontend
        res.status(500).json({ error: error.message || 'Transaction failed. Order cancelled.' });
    } finally {
        client.release();
    }
};

module.exports = {
    checkout,
};