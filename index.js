// index.js

// Load .env only in local / non-production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { startServer } = require("./src/server");

function logDeploymentEnvVariables() {
  const keys = [
    "NODE_ENV",
    "PORT",
    "ALLOWED_ORIGINS",
    "DB_MODE",
    "MONGO_URI_LOCAL",
    "REMOTE_DB_USER",
    "REMOTE_DB_PASS",
    "REMOTE_DB_IP",
    "REMOTE_DB_NAME",
    "SERVER_BASE_URL",
    "AUTH_RATE_LIMIT",
    "LOG_LEVEL",

    // Security / crypto
    "CRYPTR_SECRET",
    "JWT_SECRET",
    "BCRYPT_SALT_ROUNDS",
    "ACCESS_TOKEN_EXPIRES_IN",

    // Email
    "EMAIL_USERNAME",
    "EMAIL_PASSWORD",
    "NOTIFY_EMAILS_SUCCESS",
    "NOTIFY_EMAILS_FAILURE",

    // Twilio
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_VERIFY_SERVICE_SID",

    // OTP
    "OTP_EXPIRE_MINUTES",
    "OTP_MAX_ATTEMPTS",

    // File Paths
    "UPLOADS_BASE_PATH",
    "PROFILE_PIC_PATH",
    "CERTIFICATES_PATH",
    "WORK_ASSETS_PATH",

    // Deployment metadata
    "DEPLOYMENT_TIMESTAMP",
    "SERVICE_NAME",
    "HOSTNAME",
    "HOSTIP",
    "GITHUB_SHA",
    "GITHUB_ACTOR",
    "GITHUB_REPOSITORY",
    "GITHUB_SERVER_URL",
  ];

  console.log("=== Deployment Environment Variables ===");
  keys.forEach((key) =>
    console.log(`${key}: ${process.env[key] || "NOT SET"}`)
  );
  console.log("=======================================");
}

logDeploymentEnvVariables();

// Start server
startServer();
