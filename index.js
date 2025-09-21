// index.js
require("dotenv").config();
const { startServer } = require("./src/server");

// index.js

function logDeploymentEnvVariables() {
  const envVars = {
    SERVER_USER: process.env.SERVER_USER,
    SERVER_IP: process.env.SERVER_IP,
    SERVER_SSH_KEY: process.env.SERVER_SSH_KEY,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    NOTIFY_EMAILS_SUCCESS: process.env.NOTIFY_EMAILS_SUCCESS,
    NOTIFY_EMAILS_FAILURE: process.env.NOTIFY_EMAILS_FAILURE,
    GITHUB_SHA: process.env.GITHUB_SHA,
    GITHUB_ACTOR: process.env.GITHUB_ACTOR,
    GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
    GITHUB_SERVER_URL: process.env.GITHUB_SERVER_URL,
    DEPLOYMENT_TIMESTAMP: process.env.DEPLOYMENT_TIMESTAMP,
    SERVICE_NAME: process.env.SERVICE_NAME,
    HOSTNAME: process.env.HOSTNAME,
    HOSTIP: process.env.HOSTIP,
  };

  console.log("=== Deployment Environment Variables ===");
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`${key}: ${value || "NOT SET"}`);
  }
  console.log("=======================================");
}

// Call this function at startup
logDeploymentEnvVariables();


// Start server
startServer();
