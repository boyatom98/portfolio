const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { authenticateToken } = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Load routes
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(__dirname + "/uploads"));

// API Routes
app.use("/api", authRoutes);
app.use("/api/test", testRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend API is running" });
});

// Handle 404 API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Backend API running on http://localhost:${PORT}`));

