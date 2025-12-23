import express from "express";
import { addAddress } from "../controllers/addressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addAddress);

export default router;
