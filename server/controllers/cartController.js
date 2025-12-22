// server/controllers/cartController.js (Contains Checkout Logic)
const pool = require('../config/db');
const { sendOrderConfirmation } = require('./emailController');
const userModel = require('../models/userModel'); // <--- Import Models
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');


// @route   POST /api/orders/checkout
// @desc    Process order, create records, and send email (Protected)
const checkout = async (req, res) => {
    const { items, totalAmount } = req.body;
    const userId = req.userId; // Set by the 'protect' middleware

    if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Fetch user email for confirmation email
        const user = await userModel.findUserById(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        const userEmail = user.email;
        const userName = user.name;

        // 2. Create the Order record (using Model function)
        const order = await orderModel.createOrder(client, userId, totalAmount);
        const orderId = order.id;

        // 3. Process each item: insert, check stock, and update stock
        const itemDetailsForEmail = []; 
        
        const orderItemPromises = items.map(async (item) => {
            const { productId, quantity, price } = item;

            // Check stock (using Model function)
            const product = await productModel.findProductById(productId);
            if (!product) {
                 throw new Error(`Product ID ${productId} not found.`);
            }
            const { name, stock_quantity: currentStock } = product;

            if (currentStock < quantity) {
                 throw new Error(`Insufficient stock: Only ${currentStock} of ${name} remain.`);
            }

            // Insert into order_items (using Model function)
            await orderModel.createOrderItem(client, orderId, productId, quantity, price);

            // Update product stock (decrement)
            // Note: We need a dedicated stock update function using the transactional client.
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

        await Promise.all(orderItemPromises);

        // 4. Commit the transaction
        await client.query('COMMIT');

        // 5. Send order confirmation email
        await sendOrderConfirmation(userEmail, order, itemDetailsForEmail);

        res.status(200).json({ 
            message: 'Order placed successfully and confirmation email sent.',
            orderId: orderId,
            totalAmount: totalAmount,
            orderDate: order.order_date,
            userName: userName,
            items: itemDetailsForEmail
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Checkout error:', error.message);
        res.status(500).json({ error: error.message || 'Transaction failed. Order cancelled.' });
    } finally {
        client.release();
    }
};

module.exports = {
    checkout,
};