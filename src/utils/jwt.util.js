const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"; // e.g. 15m
const REFRESH_TOKEN_BYTES = 48; // length for random refresh token

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET missing from .env - exiting");
  process.exit(1);
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateRefreshTokenPlain() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex"); // returned to client
}

function hashRefreshToken(refreshToken) {
  // one-way hash to store in DB (so plain token not in DB)
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshTokenPlain,
  hashRefreshToken,
};
