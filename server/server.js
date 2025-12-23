// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ===============================
// Load environment variables
// ===============================
dotenv.config();

// ===============================
// Initialize Express app
// ===============================
const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ===============================
// Database Connection
// ===============================
import "./config/db.js";

// ===============================
// Route Imports
// ===============================
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// ===============================
// Root Route
// ===============================
app.get("/", (req, res) => {
  res.send("Construction E-commerce API is running!");
});

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);     // ✅ VERY IMPORTANT
app.use("/api/payment", paymentRoutes);  // Razorpay

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===============================
// Server Start
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
