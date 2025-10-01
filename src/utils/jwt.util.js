const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"; // e.g. 15m
const REFRESH_TOKEN_BYTES = parseInt(
  process.env.REFRESH_TOKEN_BYTES || "48",
  10
);
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30",
  10
);

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET missing from environment. Exiting.");
  process.exit(1);
}

/**
 * Sign an access JWT. Payload should be a plain object (avoid secrets here).
 * We'll include coach id as `sub`.
 */
function signAccessToken(payload) {
  // jwt.sign accepts `expiresIn` string like '15m'
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/**
 * Verify access token. Returns decoded payload or null on failure.
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Generate random refresh token plain string (returned to client)
 */
function generateRefreshTokenPlain() {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
}

/**
 * Hash refresh token for storage (one-way)
 */
function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(String(refreshToken)).digest("hex");
}

/**
 * Compute refresh token expiry Date object based on env days
 */
function refreshTokenExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return d;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshTokenPlain,
  hashRefreshToken,
  refreshTokenExpiryDate,
};
