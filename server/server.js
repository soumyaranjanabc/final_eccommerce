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
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
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
import cartRoutes from "./routes/cartRoutes.js"; // if still used
import categoryRoutes from "./routes/categoryRoutes.js";

// 🔽 NEW ROUTES (CHECKOUT FLOW)
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
// API Route Mounting
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ⚠️ Keep cart routes ONLY if you still use them
app.use("/api/cart", cartRoutes);

// ✅ NEW – CHECKOUT FLOW ROUTES
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ===============================
// Global Error Handler (Optional but Recommended)
// ===============================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===============================
// Server Startup
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
