import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createPayment = async (req, res) => {
  const { amount, orderId } = req.body;

  const paymentOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `order_${orderId}`,
  });

  res.json(paymentOrder);
};

export const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  await pool.query(
    "UPDATE orders SET status='PAID', paid_at=NOW() WHERE id=$1",
    [orderId]
  );

  res.json({ success: true });
};
