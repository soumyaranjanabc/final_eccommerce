import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";
import { findUserById } from "../models/userModel.js";
import {
  findProductById,
} from "../models/productModel.js";
import {
  createOrder,
  createOrderItem,
} from "../models/orderModel.js";

/**
 * @route   POST /api/orders/checkout
 * @desc    Process order, create records, update stock, send email
 * @access  Protected
 */
export const checkout = async (req, res) => {
  const { items, totalAmount } = req.body;

  // authMiddleware sets req.user = { id }
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Fetch user
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userEmail = user.email;
    const userName = user.name;

    // 2️⃣ Create order (₹ INR)
    const order = await createOrder(
      client,
      userId,
      Number(totalAmount)
    );
    const orderId = order.id;

    // 3️⃣ Process items
    const itemDetailsForEmail = [];

    for (const item of items) {
      const { productId, quantity, price } = item;

      const product = await findProductById(productId);
      if (!product) {
        throw new Error(`Product ID ${productId} not found`);
      }

      const { name, stock_quantity } = product;

      if (stock_quantity < quantity) {
        throw new Error(
          `Insufficient stock: Only ${stock_quantity} of ${name} left`
        );
      }

      // Insert order item (₹ INR)
      await createOrderItem(
        client,
        orderId,
        productId,
        quantity,
        Number(price)
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

    // 4️⃣ Commit
    await client.query("COMMIT");

    // 5️⃣ Email
    await sendOrderConfirmation(
      userEmail,
      order,
      itemDetailsForEmail
    );

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
      error: error.message || "Transaction failed. Order cancelled.",
    });
  } finally {
    client.release();
  }
};
