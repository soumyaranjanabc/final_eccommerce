import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { placeOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authMiddleware, placeOrder);

export default router;
