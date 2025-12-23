// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ===============================
// Load Environment Variables FIRST
// ===============================
dotenv.config();

// ===============================
// Initialize Express App
// ===============================
const app = express();
const PORT = process.env.PORT || 5001;

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
app.use(express.urlencoded({ extended: true }));

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
// Health Check / Root
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("✅ Construction E-commerce API is running");
});

// ===============================
// API Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);      // order + email trigger
app.use("/api/payment", paymentRoutes);   // razorpay

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email User Loaded: ${process.env.EMAIL_USER}`);
});
