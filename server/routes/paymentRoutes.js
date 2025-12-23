import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createPayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create", authMiddleware, createPayment);
router.post("/verify", authMiddleware, verifyPayment);

export default router;
