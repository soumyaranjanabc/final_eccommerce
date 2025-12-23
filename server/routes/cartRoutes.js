// server/routes/cartRoutes.js
// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Cart is frontend-managed
// router.get("/", authMiddleware, (req, res) => {
//   res.json({ message: "Cart is frontend-managed" });
// });

// export default router;

// server/routes/cartRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrder,
  verifyRazorpayPayment,
} from "../controllers/orderController.js";

const router = express.Router();

/**
 * =========================================
 * ORDERS ROUTES
 * Base path: /api/orders
 * =========================================
 */

/**
 * CREATE ORDER
 * Used for:
 * - Cash on Delivery
 * - Razorpay (before payment)
 *
 * POST /api/orders
 */
router.post("/", authMiddleware, createOrder);

/**
 * VERIFY RAZORPAY PAYMENT
 * Called after successful Razorpay payment
 *
 * POST /api/orders/verify-payment
 */
router.post(
  "/verify-payment",
  authMiddleware,
  verifyRazorpayPayment
);

/**
 * OPTIONAL: Get user orders (future use)
 *
 * GET /api/orders/my-orders
 */
// router.get("/my-orders", authMiddleware, getUserOrders);

export default router;

