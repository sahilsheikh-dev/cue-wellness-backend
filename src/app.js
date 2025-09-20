// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import routes
const adminRoutes = require("../src/routes/admin/adminRoutes");

const app = express();

// Read allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`❌ CORS blocked: ${origin}`));
      }
    },
    credentials: true, // so cookies like AuthToken work in browsers
  })
);

// API routes
app.use("/admin", adminRoutes);

// Health check / default route
app.get("/", (req, res) => {
  res.send("Welcome to Cue Wellness Backend API 🚀");
});

module.exports = app;
