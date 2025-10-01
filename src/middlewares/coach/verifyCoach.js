const { verifyAccessToken } = require("../../utils/jwt.util");
const Coach = require("../../models/coach/coachModel");
const { logError } = require("../../utils/errorLogger.util");

/**
 * options: { allowStatuses: ['verified','pending'] }
 * This middleware expects an Authorization: Bearer <accessToken> header.
 * If you want to allow using refresh cookie to obtain an access token, call refresh endpoint first.
 */
const verifyCoach = (options = {}) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken =
        authHeader && authHeader.split ? authHeader.split(" ")[1] : null;

      if (!accessToken) {
        return res
          .status(403)
          .json({ ok: false, message: "Unauthorized: No access token" });
      }

      const decoded = verifyAccessToken(accessToken);
      if (!decoded || !decoded.sub) {
        return res
          .status(403)
          .json({ ok: false, message: "Unauthorized: Invalid access token" });
      }

      const coach = await Coach.findById(decoded.sub).lean();
      if (!coach) {
        await logError({
          name: "verifyCoach_not_found",
          file: "middlewares/coach/verifyCoach.js",
          description: "Token sub not matched to any coach",
          section: "coach",
          priority: "medium",
        });
        return res
          .status(403)
          .json({ ok: false, message: "Unauthorized: Coach not found" });
      }

      if (coach.isBlocked) {
        return res.status(403).json({ ok: false, message: "Account blocked" });
      }

      if (options.allowStatuses && Array.isArray(options.allowStatuses)) {
        if (!options.allowStatuses.includes(coach.status))
          return res
            .status(403)
            .json({ ok: false, message: "Insufficient status" });
      }

      req.coach = coach;
      next();
    } catch (err) {
      await logError({
        name: "verifyCoach_exception",
        file: "middlewares/coach/verifyCoach.js",
        description: err && err.message ? err.message : String(err),
        stack: err && err.stack ? err.stack : undefined,
        section: "coach",
        priority: "high",
      });
      console.error("verifyCoach error:", err);
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  };
};

module.exports = verifyCoach;
