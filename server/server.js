// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // bodyParser NOT needed in Express 5

// --- Database Connection ---
import "./config/db.js";

// --- Route Imports ---
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Construction E-commerce API is running!");
});

// --- API Route Mounting ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", cartRoutes);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
