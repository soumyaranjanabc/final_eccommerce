// server/controllers/orderController.js

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ✅ Import CommonJS models safely
const Order = require("../models/orderModel.js");
const User = require("../models/userModel.js");

import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, addressId, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // 1️⃣ Fetch user email
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Create order
    const order = await Order.create({
      user_id: userId,
      address_id: addressId,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      status: "PLACED",
    });

    // 3️⃣ Send confirmation email ✅
    await sendOrderConfirmation({
      order: {
        id: order.id,
        total_amount: order.total_amount,
        email: user.email,
      },
      items,
      paymentMethod,
    });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order.id,
    });
  } catch (error) {
    console.error("❌ Order placement failed:", error);
    next(error);
  }
};
