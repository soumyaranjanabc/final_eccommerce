import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkout from "../controllers/orderController.js"; // ✅ DEFAULT IMPORT

const router = express.Router();

/**
 * Base path: /api/orders
 * POST /api/orders
 */
router.post("/", authMiddleware, checkout);

export default router;
