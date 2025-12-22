import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

/**
 * @route   POST /api/orders/checkout
 * @desc    Process order, create records, update stock, send email
 * @access  Protected
 */
export const checkout = async (req, res) => {
  const { items, totalAmount } = req.body;

  // authMiddleware sets: req.user = { id }
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  // --- Start Transaction ---
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Fetch user details
    const userResult = await client.query(
      "SELECT email, name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const { email: userEmail, name: userName } = userResult.rows[0];

    // 2️⃣ Create order (₹ INR)
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, $3)
       RETURNING id, order_date, total_amount`,
      [userId, Number(totalAmount), "Pending"]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;

    // 3️⃣ Process items
    const itemDetailsForEmail = [];

    for (const item of items) {
      const { productId, quantity, price } = item;

      // Fetch product stock
      const productResult = await client.query(
        "SELECT name, stock_quantity FROM products WHERE id = $1",
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ID ${productId} not found`);
      }

      const { name, stock_quantity } = productResult.rows[0];

      if (stock_quantity < quantity) {
        throw new Error(
          `Insufficient stock for ${name}. Only ${stock_quantity} left.`
        );
      }

      // Insert order item (₹ INR)
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, productId, quantity, Number(price)]
      );

      // Update stock
      await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [quantity, productId]
      );

      itemDetailsForEmail.push({
        name,
        quantity,
        price: Number(price), // ₹ INR
      });
    }

    // 4️⃣ Commit transaction
    await client.query("COMMIT");

    // 5️⃣ Send confirmation email
    await sendOrderConfirmation(userEmail, order, itemDetailsForEmail);

    // 6️⃣ Response
    res.status(200).json({
      message: "Order placed successfully",
      orderId,
      orderDate: order.order_date,
      totalAmount: order.total_amount, // ₹ INR
      userName,
      items: itemDetailsForEmail,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", error.message);

    res.status(500).json({
      error: error.message || "Order failed. Transaction rolled back.",
    });
  } finally {
    client.release();
  }
};
