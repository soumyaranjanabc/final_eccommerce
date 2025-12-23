// server/routes/cartRoutes.js
import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * PLACE ORDER (COD or Razorpay)
 * POST /api/orders
 */
router.post("/", protect, placeOrder);

export default router;
