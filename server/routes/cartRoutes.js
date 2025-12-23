// server/routes/cartRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Cart is frontend-managed
router.get("/", authMiddleware, (req, res) => {
  res.json({ message: "Cart is frontend-managed" });
});

export default router;
