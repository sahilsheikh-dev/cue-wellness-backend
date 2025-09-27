// middlewares/coach/verifyCoach.js
const { decrypt } = require("../../utils/cryptography.util");
const Coach = require("../../models/coach/coachModel");

/**
 * options: { allowStatuses: ['verified','pending'] }
 */
const verifyCoach = (options = {}) => {
  return async (req, res, next) => {
    try {
      const rawToken =
        req.headers.token ||
        req.cookies?.CoachAuthToken ||
        (req.headers.authorization && req.headers.authorization.split(" ")[1]);

      if (!rawToken) {
        return res
          .status(403)
          .json({ res: false, alert: "Unauthorized: No token" });
      }

      let token;
      try {
        token = decrypt(rawToken);
      } catch (e) {
        token = rawToken;
      }

      const coach = await Coach.findOne({ token });
      if (!coach) {
        return res
          .status(403)
          .json({ res: false, alert: "Unauthorized: Coach not found" });
      }

      if (options.allowStatuses && Array.isArray(options.allowStatuses)) {
        if (!options.allowStatuses.includes(coach.status)) {
          return res
            .status(403)
            .json({ res: false, alert: "Insufficient status" });
        }
      }

      req.coach = coach;
      next();
    } catch (err) {
      console.error("verifyCoach error:", err);
      res.status(500).json({ res: false, alert: "Internal server error" });
    }
  };
};

module.exports = verifyCoach;
