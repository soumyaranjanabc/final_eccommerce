import express from "express";
import {
  getAllProducts,
  manageProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/ownerAuthMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);

// Admin / Owner
router.post("/manage", protect, isOwner, manageProduct);
router.put("/manage/:id", protect, isOwner, manageProduct);
router.delete("/manage/:id", protect, isOwner, deleteProduct);

export default router;
