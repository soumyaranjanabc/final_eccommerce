import express from "express";
import { checkout } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Checkout route
router.post("/checkout", protect, checkout);

export default router;
