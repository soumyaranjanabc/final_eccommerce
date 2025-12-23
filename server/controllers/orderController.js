// server/controllers/orderController.js
import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

/**
 * PLACE ORDER
 * POST /api/orders
 */
export const placeOrder = async (req, res) => {
  const { items, totalAmount, addressId, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Create Order
    const orderResult = await client.query(
      `
      INSERT INTO orders (
        user_id,
        total_amount,
        status,
        address_id,
        payment_method,
        payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        userId,
        totalAmount,
        "PLACED",
        addressId,
        paymentMethod,
        paymentMethod === "razorpay" ? "PAID" : "COD_PENDING",
      ]
    );

    const order = orderResult.rows[0];

    // 2️⃣ Insert Order Items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price_at_purchase
        )
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    // 3️⃣ Send Email
    await sendOrderConfirmation({
      order,
      items,
      paymentMethod,
    });

    // 4️⃣ Response
    res.status(201).json({
      success: true,
      orderId: order.id,
      paymentMethod,
      paymentStatus: order.payment_status,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order placement failed:", error);
    res.status(500).json({ error: "Failed to place order" });
  } finally {
    client.release();
  }
};
