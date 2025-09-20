// simple middleware to extract token from header/cookie and attach coach (unverified or verified) to req
const { decrypt } = require("../utils/cryptography");
const Coach = require("../models/Coach");
const CoachUnverified = require("../models/CoachUnverified");

async function attachCoach(req, res, next) {
  try {
    let token = req.headers["authorization"] || (req.cookies && req.cookies.AuthToken);
    if (!token) return next(); // no token, continue as unauthenticated

    // token might be encrypted cookie, try decrypt
    try { token = decrypt(token); } catch (e) { /* ignore */ }

    // find in unverified then verified
    let coach = await CoachUnverified.findOne({ token }) || await Coach.findOne({ token });
    if (coach) req.coach = coach;
  } catch (err) {
    // don't block requests on auth parse errors, but log
    console.error("attachCoach error:", err.message);
  } finally {
    return next();
  }
}

module.exports = attachCoach;
