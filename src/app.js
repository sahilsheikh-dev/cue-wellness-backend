// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import routes
const adminRoutes = require("../src/routes/admin/adminRoutes");
const otpRoutes = require("../src/routes/otpRoutes");
const coachRoutes = require("../src/routes/coach/coachRoutes");
const activitiesRoutes = require("./routes/activities/activitiesRoute")

const app = express();

// Read upload base path from .env
const { UPLOADS_BASE_PATH } = process.env;

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
app.use("/activities", activitiesRoutes)

// Health check /health default route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// / default route of the application
app.get("/", (req, res) => {
  res.send("Welcome to Cue Wellness Backend API 🚀");
});

// static middleware to serve images/videos from /uploads:
app.use("/uploads", express.static(UPLOADS_BASE_PATH));

module.exports = app;
