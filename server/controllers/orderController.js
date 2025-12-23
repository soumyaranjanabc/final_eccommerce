// import pool from "../config/db.js";

// export const createOrder = async (req, res) => {
//   const userId = req.user.id;
//   const { items, totalAmount, addressId } = req.body;

//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");

//     const orderRes = await client.query(
//       `INSERT INTO orders (user_id, address_id, total_amount, status)
//        VALUES ($1,$2,$3,'PENDING')
//        RETURNING id`,
//       [userId, addressId, totalAmount]
//     );

//     const orderId = orderRes.rows[0].id;

//     for (const item of items) {
//       await client.query(
//         `INSERT INTO order_items
//          (order_id, product_id, quantity, price_at_purchase)
//          VALUES ($1,$2,$3,$4)`,
//         [orderId, item.productId, item.quantity, item.price]
//       );
//     }

//     await client.query("COMMIT");
//     res.status(201).json({ orderId });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// };

// export const getOrderById = async (req, res) => {
//   const orderId = req.params.id;

//   const order = await pool.query(
//     "SELECT * FROM orders WHERE id=$1",
//     [orderId]
//   );

//   const items = await pool.query(
//     `SELECT oi.quantity, oi.price_at_purchase, p.name
//      FROM order_items oi
//      JOIN products p ON p.id = oi.product_id
//      WHERE oi.order_id=$1`,
//     [orderId]
//   );

//   res.json({ ...order.rows[0], items: items.rows });
// };

import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

export const placeOrder = async (req, res) => {
  const { items, totalAmount, addressId, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders
      (user_id, total_amount, status, payment_method, payment_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        userId,
        totalAmount,
        "Placed",
        paymentMethod,
        paymentMethod === "razorpay" ? "paid" : "cod_pending",
      ]
    );

    const order = orderResult.rows[0];

    // Insert items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");

    // Send email
    await sendOrderConfirmation({
      order,
      items,
      paymentMethod,
    });

    res.json({
      orderId: order.id,
      paymentMethod,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
