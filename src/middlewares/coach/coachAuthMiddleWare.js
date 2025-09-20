const Coach = require("../../models/coach/coachModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, message: "Token required" });

    const coach = await Coach.findOne({ token });
    if (!coach) return res.status(401).json({ success: false, message: "Invalid token" });

    req.coach = coach; // attach coach to request
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, message: "Auth failed" });
  }
};

module.exports = authMiddleware;
