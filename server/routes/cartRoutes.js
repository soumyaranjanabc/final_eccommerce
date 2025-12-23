import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkout } from "../controllers/orderController.js";

const router = express.Router();

/**
 * Base path: /api/orders
 */

// CREATE ORDER (COD + Razorpay)
router.post("/", authMiddleware, checkout);

export default router;
