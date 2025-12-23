// server/controllers/orderController.js
import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

/**
 * PLACE ORDER
 * Route: POST /api/orders
 * Supports: COD & Razorpay
 */
export const placeOrder = async (req, res) => {
  const { items, totalAmount, addressId, paymentMethod } = req.body;
  const userId = req.user?.id;

  // --------------------
  // Validations
  // --------------------
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  if (!addressId) {
    return res.status(400).json({ error: "Address is required" });
  }

  if (!paymentMethod || !["cod", "razorpay"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Invalid payment method" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // --------------------
    // Create Order
    // --------------------
    const orderResult = await client.query(
      `
      INSERT INTO orders
      (user_id, total_amount, status, address_id, payment_method, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        userId,
        totalAmount,
        paymentMethod === "cod" ? "PLACED" : "PAID",
        addressId,
        paymentMethod,
        paymentMethod === "razorpay" ? new Date() : null,
      ]
    );

    const order = orderResult.rows[0];

    // --------------------
    // Insert Order Items
    // --------------------
    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items
        (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    // --------------------
    // Send Confirmation Email
    // --------------------
    try {
      await sendOrderConfirmation({
        order,
        items,
        paymentMethod,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
      // Email failure should NOT break order
    }

    // --------------------
    // Response
    // --------------------
    return res.status(201).json({
      success: true,
      orderId: order.id,
      paymentMethod,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ORDER ERROR:", err);

    return res.status(500).json({
      error: "Order creation failed",
    });
  } finally {
    client.release();
  }
};
