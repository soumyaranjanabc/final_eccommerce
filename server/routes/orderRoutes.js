// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { createOrder, getOrderById } from "../controllers/orderController.js";

// const router = express.Router();

// router.post("/", authMiddleware, createOrder);
// router.get("/:id", authMiddleware, getOrderById);

// export default router;

import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Create Order (COD or Razorpay)
 * POST /api/orders
 */
router.post("/", protect, placeOrder);

export default router;
