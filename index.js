// index.js

// Load .env only in local / non-production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { startServer } = require("./src/server");

function logDeploymentEnvVariables() {
  const keys = [
    "CRYPTR_SECRET",
    "EMAIL_PASSWORD",
    "EMAIL_USERNAME",
    "REMOTE_DB_PASS",
    "REMOTE_DB_USER",
    "SERVER_IP",
    "SERVER_USER",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_VERIFY_SERVICE_SID",
    "ALLOWED_ORIGINS",
    "CERTIFICATES_PATH",
    "DB_MODE",
    "MONGO_URI_LOCAL",
    "NOTIFY_EMAILS_FAILURE",
    "NOTIFY_EMAILS_SUCCESS",
    "OTP_EXPIRE_MINUTES",
    "OTP_MAX_ATTEMPTS",
    "PORT",
    "PROFILE_PIC_PATH",
    "REMOTE_DB_IP",
    "REMOTE_DB_NAME",
    "UPLOADS_BASE_PATH",
    "WORK_IMAGES_PATH",
    "DEPLOYMENT_TIMESTAMP",
    "SERVICE_NAME",
    "HOSTNAME",
    "HOSTIP",
    "GITHUB_SHA",
    "GITHUB_ACTOR",
    "GITHUB_REPOSITORY",
    "GITHUB_SERVER_URL",
    "SERVER_BASE_URL",
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
