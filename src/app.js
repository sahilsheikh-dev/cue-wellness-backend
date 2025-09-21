// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import routes
const adminRoutes = require("../src/routes/admin/adminRoutes");
const otpRoutes = require("../src/routes/otpRoutes");
const coachRoutes = require("../src/routes/coach/coachRoutes");

const app = express();

// Read allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
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
app.use("/otp", otpRoutes);
app.use("/coach", coachRoutes);

// Health check /health default route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// / default route
app.get("/", (req, res) => {
  res.send("Welcome to Cue Wellness Backend API 🚀");
});

module.exports = app;
